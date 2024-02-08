//Show the list of users
//just for testing
import { authedFetch } from '@/utils';

async function getUsers() {
  const result = await authedFetch('http://localhost:8080/allUsers');
}
export default async function UserList() {
  return <main></main>;
}
