import {Router} from 'express';
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, refereshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router()

router.route('/register').post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name:'coverImage',
            maxCount: 1
        }
    ]),  // with this we can send images 
    registerUser
)

router.route('/login').post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route('/refresh-token').post(refereshAccessToken)
router.route('/change-password').post(verifyJWT, changeCurrentPassword);
router.route('/current-user').get(verifyJWT, getCurrentUser)
router.route('/update-profile').patch(verifyJWT, updateAccountDetails) // patch matlab only the one changeing will be updated not all 
router.route('/avatar').patch(verifyJWT, upload.single('avatar'), updateUserAvatar)
router.route('/cover-image').patch(verifyJWT, upload.single('coverImage'), updateUserCoverImage)
router.route('/c/:username').get(verifyJWT, getUserChannelProfile) // this : is used in router because we are taking data from params
router.route('/history').get(verifyJWT, getWatchHistory)
export default router 