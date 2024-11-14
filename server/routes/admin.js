const express = require('express')
const router = express.Router();
const Post = require('../models/post.js')
const userModel = require('../models/userModel.js')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminLayout = '../views/layouts/admin.ejs'
const jwtSecret = process.env.JWT_SECRET;




//Ckeck login

const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({message: 'Unauthorized'});
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.userId = decoded.userId;
        next();
    } catch(error) {
        res.status(401).json({message: 'Unauthorized'});
    }
}






//Routes get admin login page
router.get('/admin', async (req, res) => {
    try {
        const locals = {
            title:"Admin",
            description: "Simple blog created with Nodejs, Express & Mongodb"
        }

        res.render('admin/index', {locals, layout: adminLayout})         
    } catch (error) {
        console.log(error)   
    }
});


//Routes admin ckeck login
router.post('/admin', async (req, res) => {
    try {
        const {username, password} = req.body;

        const user =  await userModel.findOne({username})
        if (!user){
            return res.status(401).json({message:'Invalid Credentials'})
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(401).json({message:'Invalid Credentials'});
        }

        const token = jwt.sign({userId: user._id}, jwtSecret)
        res.cookie('token', token, {httpOnly: true});
        res.redirect('./dashboard');

    } catch (error) {
        console.log(error)   
    }
});



//Admin Dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {

    try {
        const locals = {
            title:"Admin",
            description: "Simple blog created with Nodejs, Express & Mongodb"
        }

        const data = await Post.find();
        res.render('admin/dashboard', {
            locals,
            data,
            layout: adminLayout
            
        });
        
    } catch (error) {
        console.log(error)  
    }
});


//get
//Admin create new post
router.get('/add-post', authMiddleware, async (req, res) => {

    try {
        const locals = {
            title:"Add-Post",
            description: "Simple blog created with Nodejs, Express & Mongodb"
        }

        const data = await Post.find();
        res.render('admin/add-post', {
            locals,
            layout: adminLayout 
        });
        
    } catch (error) {
        console.log(error)  
    }
});


//Post Admin create new post
router.post('/add-post', authMiddleware, async (req, res) => {

    try {
        try {
            const newPost = new Post({
                title: req.body.title,
                body: req.body.body
            });
             
            await Post.create(newPost);
            res.redirect('/dashboard');

        } catch (error) {
            console.log(error)
            
        }
  
    } catch (error) {
        console.log(error)  
    }
});



//Get Admin create new post
router.get('/edit-post/:id', authMiddleware, async (req, res) => {
    try {

        const locals = {
            title:"Edit Post",
            description: "Free Nodejs user management system"
        };

        const data = await Post.findOne({_id: req.params.id})
        res.render('admin/edit-post', {
            locals,
            data,
            layout:adminLayout

        })
  
    } catch (error) {
        console.log(error)  
    }
});


//PUT Admin create new post
router.put('/edit-post/:id', authMiddleware, async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            body: req.body.body,
            updatedAt: Date.now()
        });

        res.redirect(`/edit-post/${req.params.id}`)
  
    } catch (error) {
        console.log(error)  
    }
});


// //Routes admin ckeck login
// router.post('/admin', async (req, res) => {
//     try {
//         const {username, password} = req.body;
//         if (req.body.username ==='admin' && req.body.password === 'password'){
//             res.send("You are logged in")
//         } else {
//             res.send("Wrong username or password")
//         }

//     } catch (error) {
//         console.log(error)   
//     }
// });


//Routes admin register
router.post('/register', async (req, res) => {
    try {
        const {username, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        try {
            const user = await userModel.create({username, password:hashedPassword})
            res.status(201).json({message: 'User Created', user});
            
        } catch (error) {
            if (error.code === 11000){
                res.status(500).json({message: 'User already in use'});
            }
            res.status(500).json({message: 'Internal server error'})
            
        }

    } catch (error) {
        console.log(error)   
    }
});



//Admin delete post
router.delete('/delete-post/:id', authMiddleware, async (req, res) => {
    try {
        
        await Post.deleteOne({_id: req.params.id });
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error)
        
    }
});

//Admin logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/')
})








module.exports = router;