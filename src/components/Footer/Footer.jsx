import React, { Component } from 'react';
import './Footer.scss';

const Footer = () => {
    return (
        <div className="footer">
            <button id="browseButton" className="btn-bottom" title="Add directory">
                <i className="fa fa-plus-circle fa-2x" aria-hidden="true"></i>
            </button>
            <button id="btn-consoles" className="btn-bottom" title="Consoles">
                <i className="fa fa-terminal fa-2x" aria-hidden="true"></i>
            </button>
            <button id="btn-folders" className="btn-bottom" title="Directories">
                <i className="fa fa-folder fa-2x" aria-hidden="true"></i>
            </button>
            <button id="removeButton" className="btn-bottom" title="Remove current directory">
                <i className="fa fa-trash fa-2x" aria-hidden="true"></i>
            </button>
        </div>
    );
}

export default Footer;
