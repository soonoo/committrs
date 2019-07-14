import { object, string, date, array, number } from 'yup';

export const paginationSchema = object().shape({
  offset: number().default(() => 0),
  limit: number().default(() => 10),
});

export const commitRequestSchema = array().of(
  object().shape({
    hash: string().required(),
    date: date().required(),
    subject: string().required(),
    body: string(),
    filesChanged: string(),
  }),
);

export const repoRequestSchema = object().shape({
  name: string().required(),
  owner: string().required(),
});

export const userPutRequestSchema = object().shape({
  name: string().required(),
  email: string(),
  avatarUrl: string(),
});

export const userPostRequestSchema = object().shape({
  name: string(),
  email: string(),
  avatarUrl: string(),
});

export const userSyncStatusSchema = object().shape({
  name: string().required(),
});

