/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { graphql, Link } from 'gatsby';
import Pagination from '../components/Pagination';

const Index = ({ data: { allMongodbGatsbyRepro = {} } = {}, pageContext }) => {
    const { edges: posts = [] } = allMongodbGatsbyRepro || {};

    return (
        <div style={{maxWidth: 900, margin: '0 auto'}}>
            {posts.length ? (
                posts.map(({ node: post }) => (
                    <Link to={`/${post.slug}/`} key={post.id}>
                        <div>
                            <p>{post.title}</p>
                            <p
                                dangerouslySetInnerHTML={{
                                    __html: post.body.childMarkdownRemark.excerpt,
                                }}
                            />
                            <hr />
                        </div>
                    </Link>
                ))
            ) : (
                <div>No posts available</div>
            )}
            <Pagination context={pageContext} />
        </div>
    );
};

export const query = graphql`
    query($skip: Int!, $limit: Int!) {
        allMongodbGatsbyRepro(limit: $limit, skip: $skip) {
            edges {
                node {
                    title
                    id
                    slug
                    body {
                        childMarkdownRemark {
                            excerpt(pruneLength: 80)
                        }
                    }
                }
            }
        }
    }
`;

Index.propTypes = {
    data: PropTypes.shape({}),
    pageContext: PropTypes.shape({}),
};

export default Index;
