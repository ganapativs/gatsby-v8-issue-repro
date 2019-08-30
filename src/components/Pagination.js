import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { Link } from 'gatsby';

const PreviousLink = styled(Link)`
    margin-right: auto;
    order: 1;
`;

const NextLink = styled(Link)`
    margin-left: auto;
    order: 3;
`;

const PageIndicator = styled.span`
    color: #333;
    position: absolute;
    left: 0;
    right: 0;
    width: 100%;
    text-align: center;
    padding: 1em 1.5em;
    z-index: -1;
    opacity: 0.7;
`;

class Pagination extends React.Component {
    render() {
        const { numPages, currentPage, slug } = this.props.context;
        const isFirst = currentPage === 1;
        const isLast = currentPage === numPages;
        const isNotPaginated = isFirst && isLast;

        const prevPageNum = currentPage - 1 === 1 ? `` : currentPage - 1;
        const nextPageNum = currentPage + 1;

        const pathPrefix = typeof slug === 'string' ? `/tag/${slug}` : '';
        const prevPageLink = isFirst ? null : `${pathPrefix}/${prevPageNum}/`;
        const nextPageLink = isLast ? null : `${pathPrefix}/${nextPageNum}/`;

        return (
            <div>
                {!isFirst && <PreviousLink to={prevPageLink}>&#8592; Prev Page</PreviousLink>}
                {!isNotPaginated && (
                    <PageIndicator>
                        {currentPage}/{numPages}
                    </PageIndicator>
                )}
                {!isLast && <NextLink to={nextPageLink}>Next Page &#8594;</NextLink>}
            </div>
        );
    }
}

Pagination.propTypes = {
    context: PropTypes.shape({
        numPages: PropTypes.number,
        currentPage: PropTypes.number,
        slug: PropTypes.string,
    }),
};

export default Pagination;
