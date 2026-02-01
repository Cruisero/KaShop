const express = require('express')
const router = express.Router()
const { upload, uploadImages, deleteImage } = require('../controllers/upload.controller')

// 上传图片 (支持多张)
router.post('/', upload.array('images', 10), uploadImages)

// 删除图片
router.delete('/:fileName', deleteImage)

module.exports = router
