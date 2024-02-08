import { User } from '@/models/user';
import { getSession } from '@/session';
import { authedFetch, buildUrl } from '@/utils';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ProfileRelations from '@/components/profileRelations';
import Collapse from '@/components/dropdown';
import PostElement from '@/components/post';
import {
  acceptFollow,
  denyFollow,
  followUser,
  pullFollowRequests,
  setProfilePrivacy,
} from '@/app/actions';
import FollowButton from '@/components/FollowButton';
import { redirect } from 'next/navigation';
import { Relationship } from '@/models/relationship';
import { Member } from '@/app/groups/[id]/page';

async function getProfile(id: number): Promise<User | undefined> {
  const result = await authedFetch(
    'http://localhost:8080/profile?id=' + id,
    'GET',
    undefined,
    'no-cache'
  );
  if (result.ok) {
    let json = await result.json();
    return json.body;
  } else {
    if (result.status == 404) {
    }
  }
}
//Generate the profile page. Renders on the server side, so no profile data leaks out client side even if it is set to private
export default async function Profile({ params }: { params: { id: number } }) {
  const profile: User | undefined = await getProfile(params.id);
  profile?.posts?.map((post) => {
    post.firstname = profile?.firstname;
    post.lastname = profile?.lastname;
  });
  if (!profile) {
    return null;
  }
  const session = await getSession();
  if (!session) {
    redirect('/authentication/login');
  }
  let isOwner = session.id === profile.id;
  let followRequests: Relationship[] | undefined;
  if (isOwner) {
    followRequests = await pullFollowRequests();
  }
  //TODO: need to get follow/following relationship and render buttons based on that.
  return (
    <main className='pl-3 pr-3'>
      <div className='flex flex-col'>
        <p className='text-4xl font-bold'>{`${profile.firstname} ${profile.lastname}`}</p>
        {profile.isPrivate && !isOwner ? (
          <div>
            <p>Profile is set to private</p>
          </div>
        ) : (
          <div className='flex flex-col'>
            <div className='mb-5 flex flex-row'>
              <div className='avatar'>
                <div className='w-[20vw] rounded'>
                  <img src={profile.avatarPath || '/placeholder.png'} />
                </div>
              </div>
              <div className='ml-2 flex flex-col'>
                {!isOwner ? (
                  <div className='flex flex-row'>
                    <form>
                      <input
                        hidden
                        defaultValue={profile.id}
                        name='userId'
                      ></input>
                      <button formAction={followUser} className='btn'>
                        Follow
                      </button>{' '}
                    </form>
                  </div>
                ) : (
                  <form>
                    <input hidden={true} name='userId' value={profile.id} />
                    <input
                      hidden={true}
                      name='newStatus'
                      value={profile.isPrivate ? '0' : '1'}
                    />
                    <button
                      className='btn w-[20vw]'
                      formAction={setProfilePrivacy}
                    >
                      {profile.isPrivate
                        ? 'Switch to Public'
                        : 'Switch to private'}
                    </button>
                  </form>
                )}
                <ProfileRelations>{profile}</ProfileRelations>
                <Item name='Email' value={profile?.email}></Item>
                <Item name='Nickname' value={profile.nickname}></Item>
                <Item name='Firstname' value={profile.firstname}></Item>
                <Item name='Lastname' value={profile.lastname}></Item>
                <Item name='About me' value={profile.aboutMe}></Item>
                {followRequests && followRequests.length > 0 ? (
                  <Collapse title={'Follow requests'}>
                    {followRequests?.map((request) => (
                      <div
                        key={request.Timestamp}
                        className='avatar flex flex-row items-center gap-3 '
                      >
                        <div className='w-12 rounded-full'>
                          <img src={request.avatarPath || '/placeholder.png'} />
                        </div>
                        <p className='font-bold'>{`${request.firstname} ${request.lastname}`}</p>
                        <form>
                          <input
                            name='targetId'
                            hidden={true}
                            value={request.FollowingId}
                          />
                          <input
                            hidden={true}
                            name='userId'
                            value={profile.id}
                          />

                          <button
                            formAction={acceptFollow}
                            className='btn btn-success'
                          >
                            Accept
                          </button>
                          <button
                            className='btn btn-error'
                            formAction={denyFollow}
                          >
                            Deny
                          </button>
                        </form>
                      </div>
                    ))}
                  </Collapse>
                ) : null}
              </div>
            </div>
            <Collapse title={'Posts by user'}>
              <p className='text-3xl'>Posts by user</p>
              {profile.posts?.map((post) => (
                <PostElement key={post.id}>{post}</PostElement>
              ))}
            </Collapse>
          </div>
        )}
      </div>
    </main>
  );
}

type ItemProps = {
  name: string;
  value: string;
};

//display each row of profile info
function Item(props: ItemProps) {
  return (
    <label className='form-control flex flex-row gap-5'>
      <span className='label-text'>{props.name}</span>
      <span className='label-text'>{props.value}</span>
    </label>
  );
}

//Element for accepting or denying follow request
function FollowRequest({ userId }: { userId: number }) {
  return (
    <div className='flex flex-row'>
      <Link href={'/link-to-profile'}>Firstname Lastname</Link>
      <button className='btn'>Accept</button>
      <button className='btn btn-error'>Deny</button>
    </div>
  );
}
