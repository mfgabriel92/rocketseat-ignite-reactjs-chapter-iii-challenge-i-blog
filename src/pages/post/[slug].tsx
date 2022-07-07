import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FaCalendarAlt, FaClock, FaUserAlt } from 'react-icons/fa';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const { isFallback } = useRouter();

  if (isFallback) {
    return 'Carregando...';
  }

  const totalMinutes = post.data.content.reduce((total, currentSection) => {
    const headingWords = currentSection.heading?.split(' ').length ?? 0;
    const bodyWords = currentSection.body.reduce(
      (totalBodyWords, currentElement) => {
        const elementWords = currentElement.text?.split(' ').length ?? 0;
        return totalBodyWords + elementWords;
      },
      0
    );

    return total + headingWords + bodyWords;
  }, 0);

  const minutesForReading = Math.ceil(totalMinutes / 200);

  return (
    <div className={styles.post}>
      <Head>
        <title>Post</title>
      </Head>
      <Header />
      <img src={post?.data?.banner?.url} alt="" />
      <article className={styles.postContent}>
        <h1>{post.data.title}</h1>
        <div className={styles.info}>
          <span>
            <FaCalendarAlt />
            {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
              locale: ptBR,
            })}
          </span>
          <span>
            <FaUserAlt /> {post.data.author}
          </span>
          <span>
            <FaClock /> {minutesForReading} min
          </span>
        </div>
        <div className={styles.postContent}>
          {post.data.content.map(({ heading, body }) => (
            <div key={heading}>
              <h2>{heading}</h2>
              {body.map(({ text }) => {
                return <p key={text}>{text}</p>;
              })}
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts', {
    lang: 'pt-BR',
  });

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('posts', String(params.slug), {});

  return {
    props: {
      post: response,
    },
    redirect: 60 * 30,
  };
};
