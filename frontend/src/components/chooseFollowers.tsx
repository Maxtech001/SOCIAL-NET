'use client';
import { useEffect, useState } from 'react';

export default function PostPrivacySelector() {
  const [value, setValue] = useState('0');
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    if (value === '2') setExpanded(true);
  }, [value]);
  return (
    <>
      <label className='form-control max-w-xs'>
        <div className='label'>
          <span className='label-text'>Privacy</span>
        </div>
        <select
          value={value}
          onChange={(event) => setValue(event.target.value)}
          name='privacy'
          className='select select-primary'
        >
          <option value='0'>Private</option>
          <option value='1'>Public</option>
          <option value='2'>Almost private</option>
        </select>
      </label>
      {expanded ? (
        <ChooseFollowers close={() => setExpanded(false)}></ChooseFollowers>
      ) : null}
    </>
  );
}

export function ChooseFollowers(x: { close: () => void }) {
  //chosen followers will be set as json stringified array value
  const [chosen, setChosen] = useState();
  //TODO: List the followers here
  return (
    <div className='absolute left-[40vw] flex h-[50vh] w-[20vw] flex-col items-center justify-between rounded-md bg-blue-500 p-2'>
      <p className='font-bold'>Choose allowed viewers</p>
      <input
        hidden={true}
        name='allowedViewers'
        value={JSON.stringify(chosen)}
      />
      <div className='flex flex-col overflow-y-auto'></div>
      <button onClick={x.close} type={'button'} className='btn w-1/2'>
        Done
      </button>
    </div>
  );
}
