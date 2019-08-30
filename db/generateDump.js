// NODE_OPTIONS=--max_old_space_size=12288 SKIP_PAGE_BUILD=1 yarn build
// Run - `mongo 127.0.0.1:27017/gatsby --eval "const pages=100" generateDump.js`
const totalPosts = pages || 100000;
const dummyData = {
	"title": "Hooli",
	// Create 10kb post body
	"body": "<span>Lorem ipsum. </span>".repeat(400),
	"slug": "hooli",
};

// Cleanup existing collection
db.repro.drop();

// Insert single dummy post data
db.repro.insert(dummyData);

// Get id of dummy post data
const id = db.repro.findOne()._id.valueOf();

// Create 100k more dummy posts
const {_id, ...rest} = db.repro.find({"_id": ObjectId(id)}).toArray()[0];
new Array(totalPosts - 1).fill(true).forEach((_, i) => {
    db.repro.insert({...rest, slug: `${rest.slug}-${i}`});
})

print('Dummy posts created. Total posts: ', db.repro.count());
