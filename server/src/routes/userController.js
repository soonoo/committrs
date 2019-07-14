import User from '../../db/model/User';
import Repo from '../../db/model/Repo';
import Commit from '../../db/model/Commit';
import SyncStatus from '../../db/model/SyncStatus';
import Router from 'koa-router';
import sequelize from '../../db/index';
import { userPutRequestSchema, userPostRequestSchema, userSyncStatusSchema } from '../schema';
import { createUser, updateUser } from '../service/userService';
import mc, { body } from '../service/mail';

const router = new Router();

/**
 * @swagger
 * /user:
 *   put:
 *     summary: Add a new user
 *     tags:
 *       - user
 *     responses:
 *       default:
 *         - description:
 *     parameters:
 *       - name: body
 *         description: User object
 *         in: body
 *         required: true
 *         type: string
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             avatarUrl:
 *               type: string
 */
router.put('/', async (ctx) => {
  const { body } = ctx.request;

  const isValid = await userPutRequestSchema.isValid(body);
  if(!isValid) {
    ctx.status = 400;
    return;
  }

  // check if user exists
  const user = await User.findOne({ where: { name: body.name } });
  if(user !== null) {
    ctx.status = 409;
    return;
  }

  ctx.body = await createUser(body);
});

// update user
router.post('/:id', async (ctx) => {
  const { id } = ctx.params;
  const { body } = ctx.request;

  const isValid = await userPostRequestSchema.isValid(body);
  if(!isValid) {
    ctx.status = 400;
    return;
  }

  // const syncStatus = await SyncStatus.findOne({ where: { name: 'ADDED' } });
  // const syncStatusId = syncStatus ? syncStatus.dataValues.id : null;
  const affected  = await updateUser({ id, ...body });
  if(affected[0] === 0) {
    ctx.status = 404;
  } else {
    ctx.status = 200;
  }
});

// update user sync status
router.post('/:id/syncStatus', async (ctx) => {
  const { id: userId } = ctx.params;
  const { name } = ctx.request.body;
  const isValid = await userSyncStatusSchema.isValid({ name });
  if(!isValid) {
    ctx.status = 400;
    return;
  }

  const status = await SyncStatus.findOne({ where: { name }});
  if(!status) {
    ctx.status = 400;
    return;
  }

  const user = await User.findByPk(userId);
  user.syncStatusId = status.get().id;
  user.save();
  ctx.status = 200;

  if(name === 'UPDATED') {
    const { name, email } = user.get();
    await mc.update(name, email);
  }
});

/**
 * @swagger
 * /user/{userName}:
 *   get:
 *     summary: Get a user
 *     tags:
 *       - user
 *     responses:
 *       default:
 *         - description:
 *     parameters:
 *       - name: userName
 *         in: path
 *         required: true
 *         type: string
 *         schema:
 *           type: string
 */
router.get('/:userName', async (ctx) => {
  const { userName } = ctx.params;
  const query = `
    SELECT u.id AS id, u.name AS name, u.email AS email, u.avatarUrl, ss.name AS syncStatus, ss.description AS syncDesc,
    COUNT(commits.id) AS totalCommits, COUNT(DISTINCT commits.repoId) AS totalRepos
    FROM users AS u
    JOIN commits
    ON u.id = commits.userId
    LEFT JOIN syncStatuses AS ss
    ON u.syncStatusId = ss.id
    WHERE u.name = :userName;
  `;
  const user = await sequelize.query(
    query,
    {
      replacements: { userName },
      type: sequelize.QueryTypes.SELECT,
    },
  );

  if(user[0].id) ctx.body = user[0];
  else ctx.status = 404;
});

export default router;

