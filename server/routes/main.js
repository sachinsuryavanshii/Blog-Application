const express = require('express')
const router = express.Router();
const Post = require('../models/post.js')

//Routes get
router.get('', async (req, res) => {
    try {
        const locals = {
             title: "Blog-Application",
             description: "Simple blog created with Nodejs, Express & Mongodb"
    }
    
    let perPage = 12;
    let page = req.query.page || 1;

    const data = await Post.aggregate([{$sort: {createdAt: -1 }}])
    .skip(perPage * page -perPage)
    .limit(perPage)
    .exec();

    const count = await Post.count;
    const nextPage = parseInt(page) + 1;
    const hasNextPage = nextPage <= Math.ceil(count / perPage)

    res.render('index', {
        locals, 
        data,
        current: page,
        nextPage: hasNextPage ? nextPage : null
    
    }) 
    } catch (error) {
        console.log(error)   

    }
});


//Routes post
router.get('/post/:id', async (req, res) => {
    try {
        let slug = req.params.id;
        const data = await Post.findById({_id:slug});

        const locals = {
            title: data.title,
            description: "Simple blog created with Nodejs, Express & Mongodb"

        }
        res.render('post', {locals, data})         
    } catch (error) {
        console.log(error)   

    }
});


//Routes for search

router.post('/search', async (req, res) => {
    try {
        const locals = {
        title: "Search",
        description: "Simple blog created with Nodejs, Express & Mongodb"
    }  
        
    let searchTerm = req.body.searchTerm;
    const searchNoSoecialChar = searchTerm.replace(/[^a-zA-Z0-9]/g,"")

    const data = await Post.find({
        $or:[
            {title: {$regex: new RegExp(searchNoSoecialChar, 'i')}},
            {body: {$regex: new RegExp(searchNoSoecialChar, 'i')}}
        ]
    });
        res.render("search", {
            data,
            locals
        })

    } catch (error) {
        console.log(error)   
    }
});


router.get('/about', (req, res) => {
    res.render('about')

});

module.exports = router;


// function insertPostData () {
//     Post.insertMany([
//         {
//             title: 'Building a blog',
//             body: 'This is the body text' 
//         },

//         {
//             title: 'Building a blog and aplication',
//             body: 'This is only body' 
//         },

//         {
//             title: 'Building a application',
//             body: 'This is the body documents' 
//         }
//     ])
// }
// insertPostData()

