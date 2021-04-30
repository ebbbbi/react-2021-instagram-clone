import React, { useState } from 'react';
import {Button} from '@material-ui/core';
import { auth, storage ,db} from './firebase';
import './ProfileImgUpload.css';

function ProfileImgUpload() {

    const [ profileImage, setProfileImage ] = useState(null);
    const [ progress, setProgress ] = useState(0);

    
    const handleChange = (e) => {
        if(e.target.files[0]){
            setProfileImage(e.target.files[0])
        }
    };
    const handleUpload = (e) => {

        if(profileImage ==null){
            alert("Please choose photo to upload.")

        }
        if(profileImage !==null){
        const uploadTask = storage.ref('profile/'+profileImage.name).put(profileImage);
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
                .ref('profile')
                .child(profileImage.name)
                .getDownloadURL()
                .then( url =>{
                    
                    //post image inside the auth object                  
                    var user = auth.currentUser;
                    user.updateProfile({                     
                      photoURL: url
                    }).then(function() {
                      // Update successful.

                      //post image inside the db (post collection docs)
                      updateProfileImagePath();
                      console.log("Profile Picture UPDATE SUCESS (B)")

                    }).catch(function(error) {
                      // An error happened.
                      alert(JSON.stringify(error));
                    });                                       
                    setProgress(0);
                    setProfileImage(null);
                    
                }
                )
            }
        )
        }
    };

    const updateProfileImagePath = ()=>{
        
        db.collection('posts').where("userid", "==", auth.currentUser.uid).get().then(
            (snapshot)=>{
             snapshot.forEach((doc)=>{
                 //update profile image url on post collection docs                
                const postId = doc.id;               
                db.collection('posts').doc(postId).update({
                    profileimageUrl: auth.currentUser.photoURL
                  }).catch((error) => alert(error.message));
              })
            }
            ).catch((error) => alert(error.message));
            console.log("Profile Picture UPDATE SUCESS (A)")
    }

    return (
        <div className="pimageUpload">
                       
            <input type="file" onChange={handleChange}/>
            <progress className="pimageUpload__progress" value={progress} max='100' />
            <Button className="pimageUpload__btn" onClick={handleUpload}>Change Profile Pic</Button>
            
        </div>
    )
}

export default ProfileImgUpload;
