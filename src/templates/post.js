/* eslint-disable react/prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'gatsby';

const PostTemplate = ({ data }) => {
    const { body } = data.mongodbGatsbyRepro;

    return <div style={{maxWidth: 900, margin: '0 auto'}} dangerouslySetInnerHTML={{ __html: body.childMarkdownRemark.html }} />;
};

PostTemplate.propTypes = {
    data: PropTypes.shape({}),
};

export const query = graphql`
    query($slug: String!) {
        mongodbGatsbyRepro(slug: { eq: $slug }) {
            body {
                childMarkdownRemark {
                    html
                }
            }
        }
    }
`;

export default PostTemplate;
