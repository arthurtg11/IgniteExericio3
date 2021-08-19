import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { RichText } from 'prismic-dom';
import Link from 'next/link';

import { format, parseISO } from 'date-fns';
import { MdDateRange } from 'react-icons/md'
import { FiUser } from 'react-icons/fi'
import { useState } from 'react';
import Head from 'next/head'

interface Post {
  uid?: string;
  updateAt: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ results, next_page }: PostPagination) {
  const [posts, setPosts] = useState<Post[]>(results)
  const [nextPage, setNextPage] = useState(next_page);

  async function HandleNextPage() {
  const refPosts = [...posts];

    const newPosts = await fetch(nextPage)
      .then(response => response.json())
      .then(data => {
        return data;
      })

    const results1 = await newPosts.results.map(post => {
      return {
        uid: post.uid,
        data: {
          title: RichText.asText(post.data.title),
          subtitle: RichText.asText(post.data.subtitle),
          author: RichText.asText(post.data.author),
        },
        updateAt: format(
          parseISO(post.first_publication_date),
          "dd MMM yyyy"
        )
      };
    })

    results1.map((e) => refPosts.push(e))

    console.log(newPosts.next_page)
    

    setNextPage(newPosts.next_page)
    setPosts(refPosts);
  }

  return (
    <>
    <Head>
      <title>SpaceTraveling | Posts</title>
    </Head>
    <main className={commonStyles.container}>
      <div className={styles.content}>
        <ul >
          {posts.map((post) => (
            <li key={post.uid}>
              <Link href={`/post/${post.uid}`} prefetch>
              <a key={post.uid}>
                <strong>{post.data.title }</strong>
              </a>
              </Link>    
              <p>{post.data.subtitle}</p>
              <div>
                <MdDateRange /> <time>{post.updateAt}</time>
                <FiUser /> <a>{post.data.author}</a>
              </div>

            </li>
          ))}
        </ul>
        {nextPage
          ? <button onClick={HandleNextPage}>
            Carregar mais posts
          </button>
          : ''}

      </div>
    </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.slug', 'posts.subtitle', 'posts.author'],
    pageSize: 2,
  })


  const results = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      data: {
        title: RichText.asText(post.data.title),
        subtitle: RichText.asText(post.data.subtitle),
        author: RichText.asText(post.data.author),
      },
      updateAt: format(
        parseISO(post.first_publication_date),
        "dd MMM yyyy"
      )
    };
  })

  const next_page = postsResponse.next_page;

  return {
    props: {
      results,
      next_page
    }
  }

};