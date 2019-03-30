import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CommitItem from '../CommitItem';

const RepoItem = ({ owner, name, id: repoId, totalCommits, commits, fetchCommits, userId }) => {
  const [listVisibility, setListVisibility] = useState(false);
  const repoPath = `${owner}/${name}`;
  const dataKey = `${userId}/${repoId}`;
  const data = commits[dataKey] ? commits[dataKey].commits : [];

  const onRepoClick = () => {
    if(!listVisibility) fetchCommits(userId, repoId);
    setListVisibility(!listVisibility)
  };

  return (
    <div onClick={onRepoClick}>
      <div>{repoPath}</div>
      <div>{totalCommits}</div>
      {listVisibility &&
          data.map((commit) => {
            commit.repoPath = repoPath;
            return <CommitItem key={commit.hash} commitInfo={commit} />;
          })
      }
    </div>
  );
};

const { number, string } = PropTypes;
export const repoShape = {
  owner: string.isRequired,
  name: string.isRequired,
  id: number.isRequired,
  totalCommits: number.isRequired,
  userId: number.isRequired,
};

RepoItem.propTypes = repoShape;

export default RepoItem;

