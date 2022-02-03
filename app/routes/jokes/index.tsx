import { Joke } from '@prisma/client'
import { LoaderFunction, useLoaderData } from 'remix'
import { db } from '~/utils/db.server'

type LoaderData = { joke: Joke };

export const loader: LoaderFunction = async () => {
  const count = await db.joke.count();
  const randomRowNumber = Math.floor(Math.random() * count)
  const joke = await db.joke.findFirst({
    take: 1,
    skip: randomRowNumber,
  })
  if (!joke) throw new Error('No jokes found');

  const data: LoaderData = { joke }
  return data;
}

export default () => {
  const { joke } = useLoaderData<LoaderData>();

  return (
    <div>
      <p>Here's a random joke:</p>
      <p>{joke.content}</p>
    </div>
  )
}