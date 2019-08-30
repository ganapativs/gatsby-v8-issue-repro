const mongoOptions = {
    dbName: 'gatsby',
    collection: ['repro'],
    server: {
        address: '127.0.0.1',
        port: '27017',
    },
    map: {
        repro: { body: `text/markdown` },
    },
};

module.exports = {
    plugins: [
        'gatsby-plugin-styled-components',
        !process.env.DISABLE_REMARK && {
            resolve: `gatsby-transformer-remark`,
            options: {
                gfm: true,
                commonmark: true,
                footnotes: true,
                pedantic: true,
                plugins: [
                    {
                        resolve: `gatsby-remark-prismjs`,
                    },
                    `gatsby-remark-autolink-headers`,
                    `gatsby-remark-sub-sup`,
                ],
            },
        },
        {
            resolve: 'gatsby-source-mongodb',
            options: mongoOptions,
        },
    ].filter(Boolean),
};
