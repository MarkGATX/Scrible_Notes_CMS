const router = require('express').Router();
const { Users } = require('../../models');

// CREATE new user
router.post('/', async (req, res) => {
    try {
        const dbUserData = await Users.create({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
        });
        console.log('user data =' + dbUserData)
        
        
        req.session.save(() => {
            req.session.loggedIn = true;
            req.session.userId = dbUserData.id;
            req.session.userName = dbUserData.username;
            console.log('session info = ' + req.session.userId)
            res.status(200).json(dbUserData);
        });
    } catch (err) {

        const responseError = res.status(500).json(err);
        // responseError.then((success) => console.log(success), (error) => console.log(error))
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const dbUserData = await Users.findOne({
            where: {
                email: req.body.email,
            },
        });
        console.log(dbUserData)
        if (!dbUserData) {
            res.status(400)
                .json({ message: 'Incorrect email or password. Please try again!' });
            return;
        }

        const validPassword = await dbUserData.checkPassword(req.body.password);

        if (!validPassword) {
            res
                .status(400)
                .json({ message: 'Incorrect email or password. Please try again!' });
            return;
        }

        req.session.save(() => {
            req.session.loggedIn = true;
            req.session.userId = dbUserData.id;
            req.session.userName= dbUserData.username

            res.status(200)
                .json({ user: dbUserData, message: 'You are now logged in!' });
        });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// Logout
router.post('/logout', (req, res) => {
    if (req.session.loggedIn) {
        req.session.destroy(() => {
            res.status(204).end();
        });
    } else {
        res.status(404).end();
    }
});

module.exports = router;