const express = require('express')
const router = express.Router();

router.get('/', (req, res) => {
    const uid = req.uid;
    let db = req.db;

    if (!uid) {
        res.status(403).send('Unauthorized')
        return;
    }
    var docRef = db.collection("tasks").doc(uid).collection("notes");

    docRef.get()
        .then(snapshot => {
            notes = []
            snapshot.forEach(doc => {
                note = doc.data();
                note.id = doc.id;
                notes.push(note);
            });
            res.send(notes);
        })
        .catch(err => {
            console.log('Error getting documents', err);
        });
})
    .post('/', (req, res) => {
        const data = req.body;
        const uid = req.uid;
        let db = req.db;
        if (!uid) {
            res.status(403).send('Unauthorized')
            return;
        }
        var docRef = db.collection("tasks").doc(uid).collection("notes");

        docRef.add(data).then(ref => {
            data.id = ref.id;
            res.status(201).send(data);
        })
            .catch(err => {
                console.log('Error while creating ', err);
                res.status(500).send('Internal Error!');
            });
    })
    .put('/:id', (req, res) => {
        const id = req.params.id;
        if (id) {
            const uid = req.uid;
            const data = req.body;
            let db = req.db;
            if (!uid) {
                res.status(403).send('Unauthorized')
                return;
            }
            var docRef = db.collection("tasks").doc(uid).collection("notes").doc(id);
            docRef.update(data);
            res.status(200).send(data);
        }
        else {
            res.status('400').send('Task with Id "' + id + '" does not exist');
        }
    })
    .delete('/:id', (req, res) => {
        const id = req.params.id;
        if (id) {
            const uid = req.uid;
            const data = req.body;
            let db = req.db;
            if (!uid) {
                res.status(403).send('Unauthorized')
                return;
            }
            var docRef = db.collection("tasks").doc(uid).collection("notes").doc(id);
            docRef.delete();
            res.status(200).send(data);
        }
        else {
            res.status('400').send('Task with Id "' + id + '" does not exist');
        }
    })

module.exports = router;