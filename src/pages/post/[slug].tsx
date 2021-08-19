import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { RichText } from 'prismic-dom';
import { format, parseISO } from 'date-fns';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { MdDateRange } from 'react-icons/md'
import { FiUser } from 'react-icons/fi'
import { BsStopwatch } from 'react-icons/bs'
import { useRouter } from 'next/router';


interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: string;
  };
  timeRead: string;
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>
  }
  return (
    
    <>
    <Head>
      <title>SpaceTraveling | {post.data.title}</title>
    </Head>   
      <img className={styles.imgBanner} src={post.data.banner.url} />
      <main className={commonStyles.container}>
        <div className={styles.content}>
          <h1>{post.data.title}</h1>
          <ul>
            <li> <MdDateRange className={styles.icon} /> {post.first_publication_date}</li>
            <li> <FiUser className={styles.icon} /> {post.data.author}</li>
            <li> <BsStopwatch className={styles.icon} /> {post.timeRead}</li>
          </ul>
          <div
             className={styles.postContent}
             dangerouslySetInnerHTML={{ __html: post.data.content }}
          />

        </div>
      </main>
    </>
  )
}

export const getStaticPaths : GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const searchPost = await prismic.getByUID('posts', String('malta-vibes-imperial-e-eliminada-apos-derrota'), {})

  return {
    paths: [
      { 
        params: {
          id: searchPost.uid,
          slug:'post',
        },
      }
    ],
    fallback: true
  }
};

export const getStaticProps : GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();
  const { slug } = params;
  var contentsHtml = '';

  const searchPost = await prismic.getByUID('posts', String(slug), {})
  
   searchPost.data.content.map((content) => {
    contentsHtml += '<h4>' + (content.heading == null ? '' : content.heading) + '</h4>',
    contentsHtml += RichText.asHtml(content.body) + ' '
  })
  const timeCalculated = Math.round(contentsHtml.split(' ').length/200);
  const timeRead = timeCalculated < 60 ? timeCalculated + ' min' : timeCalculated + ' hour';

  const post = {
    first_publication_date:  format(
      parseISO(searchPost.first_publication_date),
      "dd MMM yyyy"
    ),
    data: {
      title: RichText.asText(searchPost.data.title),
      banner: {
        url: searchPost.data.banner.url
      },
      author: RichText.asText(searchPost.data.author),
      content: contentsHtml
    },
    timeRead,
  }

  

  return {
    props: {
      post,
    },
    redirect: 60 * 30, //30 minutos, atualização do React-Static
  }
};

