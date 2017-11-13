import React, { Component } from 'react';
import './FolderItem.scss';

const FolderItem = () => {
    return (
        <div className="folder-item">
            <div className="inner-number">7</div>
            <div className="inner-path">super path</div>
            <div className="inner-text">superDirectory</div>
            <div className="directoryButton" data-path="super-directory">
                superDirectory
            </div>
        </div>
    );
}

export default FolderItem;
