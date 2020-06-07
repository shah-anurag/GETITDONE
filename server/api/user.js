express = require('express');
router = express.Router();

router.get('/', (req, res) => {
    const uid = req.uid;
    const admin = req.admin;
    if (!uid) {
        res.sendStatus(403);
        return;
    }

    admin.auth().getUser(uid)
        .then(userRecord => {
            res.send(userRecord);
        })
        .error(err => {
            console.log('Error while gettig user data: ', err);
            res.sendStatus(500);
        })
})
    .put('/', (req, res) => {
        const uid = req.uid;
        const data = req.body;
        const admin = req.admin;
        if (!uid) {
            res.sendStatus(403);
            return;
        }
        admin.auth().updateUser(uid, data)
            .then(userRecord => {
                console.log('Updated Successfully:', userRecord);
                res.send(userRecord);
            })
            .catch(err => {
                console.log('Error while updating user: ', err);
                res.sendStatus(500);
            });
    })
    .post('/', (req, res) => {
        const data = req.body;
        const admin = req.admin;
        
        admin.auth().createUser(data)
            .then(userRecord => {
                res.status(201).send(userRecord);
            })
            .catch(function (error) {
                console.log('Error creating new user:', error);
                res.sendStatus(500);
            });
    })

module.exports = router;