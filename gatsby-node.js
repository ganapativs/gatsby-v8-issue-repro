const path = require(`path`);

exports.createPages = ({ graphql, actions }) => {
    const { createPage } = actions;

    const loadPosts = new Promise(resolve => {
        graphql(
            `
                query {
                    allMongodbGatsbyRepro {
                        edges {
                            node {
                                slug
                            }
                        }
                    }
                }
            `,
        ).then((result = {}) => {
            const { data: { allMongodbGatsbyRepro = {} } = {} } = result;
            const { edges: posts = [] } = allMongodbGatsbyRepro || {};
            const postsPerPage = 30;
            const postsPerHomePage = 31;
            const numPages = Math.ceil(posts.slice(postsPerHomePage).length / postsPerPage);
            // Create main home page
            createPage({
                path: `/`,
                component: path.resolve(`./src/templates/index.js`),
                context: {
                    limit: postsPerHomePage,
                    skip: 0,
                    numPages: numPages + 1,
                    currentPage: 1,
                },
            });

            // Create additional pagination on home page if needed
            Array.from({ length: numPages }).forEach((_, i) => {
                createPage({
                    path: `${i + 2}/`,
                    component: path.resolve(`./src/templates/index.js`),
                    context: {
                        limit: postsPerPage,
                        skip: i * postsPerPage + postsPerHomePage,
                        numPages: numPages + 1,
                        currentPage: i + 2,
                    },
                });
            });

            // Speedup build for demo
            if (!process.env.SKIP_PAGE_BUILD) {
                // Create each individual post
                posts.forEach((edge, i) => {
                    const prev = i === 0 ? null : posts[i - 1].node;
                    const next = i === posts.length - 1 ? null : posts[i + 1].node;
                    createPage({
                        path: `${edge.node.slug}/`,
                        component: path.resolve(`./src/templates/post.js`),
                        context: {
                            slug: edge.node.slug,
                            prev,
                            next,
                        },
                    });
                });
            }

            resolve();
        });
    });

    return Promise.all([loadPosts]);
};

// https://www.gatsbyjs.org/docs/scaling-issues/
exports.createSchemaCustomization = ({ actions }) => {
    actions.createTypes(`
        type SitePage implements Node @dontInfer {
            path: String!
        }
    `);
};
