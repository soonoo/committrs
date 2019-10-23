import React, { useEffect, useState, Fragment } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { removeNotiAfterTimeout } from 'store/actions/noti';

import './Notifier.css';

const Item = React.memo(({ message, top, id, onClick, timeout = 3000 }) => {
  const [opacity, setOpacity] = useState(1);
  const [onEnd, setOnEnd] = useState(null);
  const [visibility, setVisibility] = useState(true);
  const [transform, setTransform] = useState('');
  const dispatch = useDispatch();
  const remove = (e, id) => {
    if(e) e.stopPropagation();
    dispatch(removeNotiAfterTimeout(id));
  };

  const props = onEnd ? {
    onTransitionEnd: (e) => {
      remove(null, id);
      setVisibility(false);
    },
  } : {};

  useEffect(() => {
    setTimeout(() => {
      setOnEnd(true);
      setOpacity(0);
    }, timeout);
  }, []);

  useEffect(() => {
    setTransform(`translate(0, ${top}px)`);
  });

  return visibility ? (
    <div {...props} style={{ top: '-20px', opacity, position: 'fixed', transform }} className='NotiItemContainer'>
      <div className='NotiItemContent' onClick={onClick}>
        <span className='NotiItemMessage'>{message}</span>
        <span className='NotiItemCloseButton' onClick={(e) => remove(e, id)}>x</span>
      </div>
    </div>
  ) : null;
});

const NotiContainer = () => {
  const messages = useSelector(state => state.noti);

  return (
    <Fragment>
      <div className='Notifier'>
        {messages.filter(m => m.visible).map((m, index) => {
          const top = ((index + 1) * 50) + ((index - 1) * 10);
          return <Item message={m.message} top={top} id={m.id} key={m.id} onClick={m.onClick} timeout={m.timeout} />
        })}
      </div>
    </Fragment>
  );
};

export default NotiContainer;
