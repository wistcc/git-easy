import React, { Component } from 'react';
import FolderItem from '../FolderItem/FolderItem';

const FolderList = () => {
    const folders = [1,2,3,4,5].map(n => (
        <FolderItem key={n} />
    ));

    return (
        <div className="folder-list">
            {folders}
        </div>
    );
}

export default FolderList;
