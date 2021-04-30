import React, {useState, useEffect} from 'react';
import './Post.css';
import Avatar from '@material-ui/core/Avatar';
import { db } from './firebase';
import { Button, Input } from '@material-ui/core';
import firebase from 'firebase';



function Post({ postId, user, username, caption, imageUrl, profileimageUrl}) {

    const[comments, setComments] = useState([]);
    const[comment, setComment] = useState({text: '',id:''});
       
    useEffect(() => {       
        let unsubscribe;
        if(postId){
            unsubscribe = db
            .collection("posts")
            .doc(postId)
            .collection("comments")
            .orderBy('timestamp','asc')
            .onSnapshot( (snapshot) =>{
                setComments(snapshot.docs.map((doc) => doc.data()));
            });
        }
        return () => {
            unsubscribe(); 
                      
        }
    }, [postId])    

    const postComment = (event) => {
        event.preventDefault();       
        db.collection("posts").doc(postId).collection("comments").add({       
            text:comment,
            username: user.displayName,           
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userid:user.uid
            
            
        });
        
        setComment('');
       
    }



    const onDelete = (iid)=> {    
    
       const ref =  db.collection("posts").doc(postId).collection("comments");
       ref.orderBy('timestamp','asc').get().then( snapshot =>{    
           
            const theId = snapshot.docs[iid].id;
            snapshot.docs.forEach( doc =>{
           
            if(doc.id === theId){
                console.log("ID match found!");
                ref.doc(theId).delete().then(() => {
                    console.log("Document successfully deleted!");
                }).catch((error) => {
                    console.error("Error removing document: ", error);
                });
            }
        })
       })      
    }


  

    return (
        <div className="post">
            <div className="post__header">
            
                <div className="profile__images">
                
                    {profileimageUrl?(<img  src={profileimageUrl} alt="Not Available"/>)
                    :(<Avatar className="post__avatar"            
                    alt={username}/>)}
                </div>
                <h3>{username}</h3>
            </div>
            <img className="post__image" src={imageUrl} alt="Not Available"/>
            <h4 className="post__text"><strong>{username}</strong>: {caption}</h4>
            
            <div className="post__comments">
               {comments.map((comment, id) => (  

                    <p key={id} id={id}>
                    <strong>{comment.username}</strong>: {comment.text} 
                    <Button disabled={!user || comment.userid !== user.uid } onClick={()=>onDelete(id)}>삭제</Button>                       
                    </p>                 
                    ))          
                }              
            </div>


            {user &&(
                <form className="post__commentBox">
                    <Input
                    className="post__input"
                    placeholder="Add comment.."
                    //value= {comment}
                    onChange={(e)=>setComment(e.target.value)}
                    />
                    <Button
                    disabled={!comment}
                    className="post__button"
                    type="submit"
                    onClick={postComment}
                    >Post</Button>
                </form>
            )}            
        </div>
    )
}

export default Post
