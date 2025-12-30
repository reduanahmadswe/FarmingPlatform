import { Router } from 'express';
import * as postController from './post.controller';

const router = Router();

router.post('/', postController.createPost);
router.get('/', postController.getPosts);
router.put('/:id/like', postController.likePost);
router.post('/:id/comment', postController.addComment);
router.post('/:id/share', postController.sharePost);
router.post('/:id/comments/:commentId/reply', postController.replyToComment);
router.put('/:id/comments/:commentId/react', postController.reactToComment);
router.delete('/:id', postController.deletePost);

export default router;
