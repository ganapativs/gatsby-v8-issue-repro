import React from 'react';
import { Link } from 'gatsby';

const NotFoundPage = () => (
    <div>
        <h4>Page Not Found</h4>
        <p>
            Please return <Link to="/">home</Link> or use the menu to navigate to a different page.
        </p>
    </div>
);

export default NotFoundPage;
