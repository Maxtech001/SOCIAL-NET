'use client';
import { User } from '@/models/user';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { redirect, useRouter } from 'next/navigation';
import { router } from 'next/client';

//Show followings and followers
export default function ProfileRelations({ children }: { children: User }) {
  const [expanded, setExpanded] = useState<{
    show: boolean;
    type: 'Followers' | 'Followings';
  }>({ show: false, type: 'Followers' }); //pops up the list of followers/followings
  const [users, setUsers] = useState<User[] | undefined>([]);
  useEffect(() => {
    async function getResult() {
      if (expanded.show) {
        //Need to fetch either followers or a list of followings
        //setting 2 placeholder users for now
        let user1: User = {
          id: 2,
          nickname: '',
          email: '',
          firstname: 'Aigar',
          lastname: 'Kuusk',
          dob: {
            day: 0,
            month: 0,
            year: 0,
          },
          aboutMe: '',
          avatarPath: '',
          isPrivate: 0,
        };
        let user2: User = {
          id: 1,
          nickname: '',
          email: '',
          firstname: 'Margus',
          lastname: 'tamm',
          dob: {
            day: 0,
            month: 0,
            year: 0,
          },
          aboutMe: '',
          avatarPath: '',
          isPrivate: 0,
        };

        const list = [user1, user2];
        setUsers(list);
      }
    }
    getResult().then();
  }, [expanded]);
  return (
    <div className='flex flex-row gap-5'>
      <p
        onClick={() =>
          setExpanded((prev) => {
            return { show: !prev.show, type: 'Followers' };
          })
        }
        className='text-2xl font-bold hover:cursor-pointer'
      >
        Followers: <span className=''>{children.followerIds?.length || 0}</span>
      </p>
      <p
        onClick={() =>
          setExpanded((prev) => {
            return { show: !prev.show, type: 'Followings' };
          })
        }
        className='text-2xl font-bold hover:cursor-pointer'
      >
        Followings:{' '}
        <span className=''>{children.followingIds?.length || 0}</span>
      </p>
      {expanded.show ? (
        <div className='absolute left-[40vw] top-[10%] h-[80vh] w-[20vw] overflow-auto rounded bg-blue-500'>
          <div className='flex flex-row justify-between'>
            <p className='text-4xl'>{expanded.type}</p>
            <button
              onClick={() => setExpanded({ show: false, type: 'Followers' })}
            >
              Close
            </button>
          </div>
          <div className='flex flex-col items-start gap-1 p-3'>
            {users?.map((user) => <Member key={user.id}>{user}</Member>)}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Member({ children }: { children: User }) {
  const router = useRouter();
  return (
    <div
      onClick={() => router.push('/profile/' + children.id)}
      className='avatar relative flex flex-row items-center hover:cursor-pointer'
    >
      <div className='mr-2 w-16 rounded-full'>
        <img src='https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg' />
      </div>
      <p>{`${children.firstname} ${children.lastname}`}</p>
    </div>
  );
}
