import React, { useState } from 'react';
import {Button} from '@material-ui/core';
import firebase from 'firebase';
import { db, storage } from './firebase';
import './ImageUpload.css';

function ImageUpload({username, userId, profileimageUrl}) {

    const [ image, setImage ] = useState(null);
    const [ progress, setProgress ] = useState(0);
    const [caption, setCaption] = useState('');
    const handleChange = (e) => {
        if(e.target.files[0]){
            setImage(e.target.files[0])
        }
    };

    const handleUpload = (e) => {
        if(image == null){
            alert("Please choose photo to upload.")
        }

        if(image !== null){            
       
        const uploadTask = storage.ref('images/'+image.name).put(image);
        uploadTask.on(
            "state_changed",
            (snapshot) =>{
                //progress fuction
                const progress = Math.round(
                    (snapshot.bytesTransferred / snapshot.totalBytes )*100
                );
                setProgress(progress);
            },
            (error) => {
                //error function
                console.log(error);
                alert(error.message);

            },
            ()=>{
                //complete function
                storage
                .ref('images')
                .child(image.name)
                .getDownloadURL()
                .then( url =>{
                    //post image inside the db
                    db.collection('posts').add({
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        caption: caption,
                        imageUrl: url,
                        username: username,
                        userid: userId,
                        profileimageUrl: profileimageUrl                   
                    });                                       

                    setProgress(0);
                    setCaption('');
                    setImage(null);
                    alert("Done posting.")

                }

                )
            }

        )
    }
    };

    return (
        <div className="imageUpload">
            <progress className="imageUpload__progress" value={progress} max='100' />          
            <input className="imageUpload__file" type="file" onChange={handleChange}/>
            <input className="imageUpload__caption" type="text" placeholder="Enter a caption." onChange={event => setCaption(event.target.value)} value={caption} />
            <Button onClick={handleUpload}>Upload Post</Button>
        </div>
    )
}

export default ImageUpload;
