import { format } from 'date-fns';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { FaCalendarAlt, FaUserAlt } from 'react-icons/fa';
import ptBR from 'date-fns/locale/pt-BR';
import styles from './home.module.scss';

import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';

interface Post {
  uid?: string;
  first_publication_date: string | null;
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

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination);

  function fetchNextPage() {
    fetch(postsPagination.next_page)
      .then(response => response.json())
      .then(data => {
        const newPosts = { ...posts };

        setPosts({
          ...newPosts,
          next_page: data.next_page,
          results: [...newPosts.results, ...data.results],
        });
      });
  }
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <Header />
      <main className={styles.home}>
        <div className={styles.posts}>
          {posts?.results?.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a className={styles.post}>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <small>
                  <time>
                    <FaCalendarAlt />
                    {format(
                      new Date(post.first_publication_date),
                      'dd MMM yyyy',
                      {
                        locale: ptBR,
                      }
                    )}
                  </time>
                  <span>
                    <FaUserAlt /> {post.data.author}
                  </span>
                </small>
              </a>
            </Link>
          ))}
        </div>
        {posts?.next_page && (
          <button
            type="button"
            onClick={fetchNextPage}
            className={styles.loadMore}
          >
            <strong>Carregar mais posts</strong>
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('posts', {
    pageSize: 1,
  });

  return {
    props: {
      postsPagination: { ...postsResponse },
    },
  };
};
