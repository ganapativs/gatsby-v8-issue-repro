# [gatsby-v8-issue-repro](https://github.com/gatsbyjs/gatsby/issues/17233)

Getting various issues(related to `V8 serialize` etc) when trying to build large number of pages(80k+ docs of 10kb each) with latest gatsby+remark resulting in the build failure.

## Prerequisites

- `mongo`

## Tools

- `node 10.6.0` (scenarios are tested on latest node also, both on MacOS and Ubuntu 16.04)
- `yarn 1.7.0`

## Custom ENV's - only for demo

- `SKIP_PAGE_BUILD` is used to skip page generations for faster builds
- `DISABLE_REMARK` env is used to skip remark transformer. This should nearly double up the successful page generation. Eg: if gatsby+remark generates 40k pages successfully, gatsby without remark generates around 70k pages successfully on 12GB RAM

## Failure scenarios

1. **Without loki**

    1. Generate 100k(10kb each) post data

        `mongo 127.0.0.1:27017/gatsby --eval "const pages=100000" ./db/generateDump.js`

    1. Build gatsby

        `yarn && yarn clean`
        `NODE_OPTIONS=--max_old_space_size=12288 SKIP_PAGE_BUILD=1 yarn build`

    1. Build crashes with `V8` error

        **Failure point:** [Code reference](https://github.com/gatsbyjs/gatsby/blob/858066f643b3465f957d3d30ef4aa34afd230369/packages/gatsby/src/redux/persist.js#L8)

        ```sh
        success run page queries - 2027.713 s — 3335/3335 1.64 queries/second

        node[11428]: ../src/node_buffer.cc:412:MaybeLocal<v8::Object> node::Buffer::New(node::Environment *, char *, size_t): Assertion `length <= kMaxLength' failed.
        1: 0x100033d65 node::Abort() [/usr/local/bin/node]
        2: 0x100032dab node::MakeCallback(v8::Isolate*, v8::Local<v8::Object>, char const*, int, v8::Local<v8::Value>*, node::async_context) [/usr/local/bin/node]
        3: 0x100046ff5 _register_buffer() [/usr/local/bin/node]
        4: 0x100098391 node::(anonymous namespace)::SerializerContext::ReleaseBuffer(v8::FunctionCallbackInfo<v8::Value> const&) [/usr/local/bin/node]
        5: 0x10022b83f v8::internal::FunctionCallbackArguments::Call(v8::internal::CallHandlerInfo*) [/usr/local/bin/node]
        6: 0x10022ad81 v8::internal::MaybeHandle<v8::internal::Object> v8::internal::(anonymous namespace)::HandleApiCallHelper<false>(v8::internal::Isolate*, v8::internal::Handle<v8::internal::HeapObject>, v8::internal::Handle<v8::internal::HeapObject>, v8::internal::Handle<v8::internal::FunctionTemplateInfo>, v8::internal::Handle<v8::internal::Object>, v8::internal::BuiltinArguments) [/usr/local/bin/node]
        7: 0x10022a3d0 v8::internal::Builtin_Impl_HandleApiCall(v8::internal::BuiltinArguments, v8::internal::Isolate*) [/usr/local/bin/node]
        8: 0x23830e0841bd
        9: 0x23830e093a09
        error Command failed with signal "SIGABRT".
        info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
        ```

1. **With loki**

    1. Generate 100k(10kb each) post data

        `mongo 127.0.0.1:27017/gatsby --eval "const pages=100000" ./db/generateDump.js`

    1. Build gatsby

        `yarn && yarn clean`
        `NODE_OPTIONS=--max_old_space_size=12288 SKIP_PAGE_BUILD=1 yarn build-loki`

    1. Build crashes at `saveState`

        **Failure point:** [Code reference](https://github.com/gatsbyjs/gatsby/blob/858066f643b3465f957d3d30ef4aa34afd230369/packages/gatsby/src/db/loki/index.js#L112)

        ```sh
        success run page queries - 1976.632 s — 3335/3335 1.69 queries/second

        Stacktrace:
        ptr1=0x25b9d2202321
            ptr2=0x0
            ptr3=0x0
            ptr4=0x0
            failure_message_object=0x7ffeefbed370

        ==== JS stack trace =========================================

            0: ExitFrame [pc: 0x355f68c041bd]
            1: StubFrame [pc: 0x355f68c85ad7]
        Security context: 0x25b9bbd9e6c9 <JSObject>
            2: saveState [0x25b910175701] [/Users/guns/public/node_modules/gatsby/dist/db/index.js:30] [bytecode=0x25b9097edb61 offset=181](this=0x25b90cd96279 <Object map = 0x25b90f1ad969>)
            3: /* anonymous */ [0x25b9850fee71](this=0x25b93d108c59 <JSGlobal Object>,0x25b9d2202321 <the_hole>)
            4: StubFrame [pc: 0x355f68c42871]
            5: StubFrame [pc: 0x355f68c21b9a]
            6: EntryFrame [pc: 0x355f68c0ba01]

        ==== Details ================================================

        [0]: ExitFrame [pc: 0x355f68c041bd]
        [1]: StubFrame [pc: 0x355f68c85ad7]
        [2]: saveState [0x25b910175701] [/Users/guns/public/node_modules/gatsby/dist/db/index.js:30] [bytecode=0x25b9097edb61 offset=181](this=0x25b90cd96279 <Object map = 0x25b90f1ad969>) {
        // stack-allocated locals
        var .generator_object = 0x25baaacb2ee9 <JSGenerator>
        var /* anonymous */ = 0x25baaacb2eb9 <Promise map = 0x25b9b4783e89>
        // expression stack (top to bottom)
        [11] : 0x25b9d2202321 <the_hole>
        [10] : 0x25b9097ed889 <String[24]: Error persisting state: >
        [09] : 0x25b921b04c89 <Object map = 0x25b983544361>
        [08] : 0x25b9794ede29 <JSBoundFunction (BoundTargetFunction 0x25b9794ecbf1)>
        [07] : 0x25b9101767b9 <FunctionContext[9]>
        [06] : 0x25b9850ff331 <CatchContext[5]>
        [05] : 0x25b9101767b9 <FunctionContext[9]>
        [04] : 0x25b9101767b9 <FunctionContext[9]>
        [03] : 0x25b90cd96279 <Object map = 0x25b90f1ad969>
        [02] : 0x25b910175701 <JSFunction saveState (sfi = 0x25b9996e74f9)>
        --------- s o u r c e   c o d e ---------
        function saveState() {\x0a  if (saveInProgress) return;\x0a  saveInProgress = true;\x0a\x0a  try {\x0a    await Promise.all(dbs.map(db => db.saveState()));\x0a  } catch (err) {\x0a    report.warn(`Error persisting state: ${err && err.message || err}`);\x0a  }\x0a\x0a  saveInProgress = false;\x0a}
        -----------------------------------------
        }

        [3]: /* anonymous */ [0x25b9850fee71](this=0x25b93d108c59 <JSGlobal Object>,0x25b9d2202321 <the_hole>) {
        // optimized frame
        --------- s o u r c e   c o d e ---------
        <No Source>
        -----------------------------------------
        }
        [4]: StubFrame [pc: 0x355f68c42871]
        [5]: StubFrame [pc: 0x355f68c21b9a]
        [6]: EntryFrame [pc: 0x355f68c0ba01]
        =====================

        error Command failed with signal "SIGILL".
        info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
        ```

## Notes

- Surprisingly builds 200k(4.5kb each post) posts successfully on old gatsby version(`2.3.19`)+remark+28GB RAM. shows a redux persisting state warning, but everything works

    **Warning point:** [Code reference](https://github.com/gatsbyjs/gatsby/blob/c043816915c0e4b632730091c1d14df08d6249d4/packages/gatsby/src/redux/persist.js#L37) - uses `JSON.stringify` instead of `v8.serialize`

    ```sh
    info bootstrap finished - 2531.564 s
    ⠀
    // Note the warning here
    warn Error persisting state: Invalid string length
    success Building production JavaScript and CSS bundles - 7.767 s
    success Building static HTML for pages - 1.134 s — 3/3 16.26 pages/second
    info Done building in 2578.049 sec
    ```

- Even if 12GB RAM is allocated, build mostly uses 7GB types. So, these errors are mostly not memory related. To prove this, run the same scenarios with 28GB RAM, ended up in same results
- There is no way to disable the cache in build altogether. This would have solved the scalability issue for now. At least [`DANGEROUSLY_DISABLE_OOM`](https://github.com/gatsbyjs/gatsby/pull/14767) would have helped 😅
- Mostly uses single CPU core except when generating html/js - known issue in Gatsby repo
- Incremental build is badly needed for pages of this scale :(
- Slow page queries(21.56 queries/second (82669 pages)), probably IO issue? [materialization PR](https://github.com/gatsbyjs/gatsby/pull/16091) might help?
- End goal is to scale the gatsby build for **500k+ pages** with latest gatsby+remark 😅
