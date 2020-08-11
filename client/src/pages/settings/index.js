import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from 'components/Header';
import { addNoti, removeNotiAfterTimeout } from 'store/actions/noti';
import { AUTH_STATUS } from 'store/reducers/auth';
import { GITHUB_LOGIN_URL } from 'constants/index';
import uuid from 'uuid/v4';

import './settings.css';

const login = () => {
  window.location.href = `${GITHUB_LOGIN_URL}?redirect_to=${encodeURI(window.location.href)}`;
};

const SettingsPage = ({ staticContext = {} }) => {
  const dispatch = useDispatch();
  const { github_login, avatarUrl, id } = useSelector(state => state.auth);
  const { authorized } = useSelector(state => state.auth);

  useEffect(() => {
    const messageId = uuid();
    if(authorized === AUTH_STATUS.NOT_LOGGED_IN) {
      dispatch(addNoti('Click me to sign in first! 😄', login, 1000000, messageId));
    }
    return () => dispatch(removeNotiAfterTimeout(messageId));
  }, [authorized]);

  return (
    <div>
      <Header />
      <div className='settings'>
        <div className='wrapper'>
          <h1>Settings</h1>
          <h2 className='SettingsMenu'>Connected accounts</h2>
            <hr />
            <div className='AccountWrapper'>
              <span className='Account'>GitHub</span>
              <input className='AccountInput' value={github_login} disabled />
            </div>
            <div className='AccountWrapper'>
              <span className='Account'>MDN</span>
              <input className='AccountInput' value='' disabled />
              <button className='AccountChangeButton'>change</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
