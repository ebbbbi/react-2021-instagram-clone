
import React, { useState, useEffect } from 'react';
import './App.css';
import Post from './Post';
import { db, auth } from './firebase';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import { Button , Input } from '@material-ui/core';
import ImageUpload from './ImageUpload';
import ProfileImgUpload from './ProfileImgUpload';
import Avatar from '@material-ui/core/Avatar';
import firebase from 'firebase';
import Backdrop from '@material-ui/core/Backdrop';

function refreshPage() {
  window.location.reload(false);
}

function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: '75%',
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  backdrop:{
		
    //zIndex: theme.zIndex.drawere +1,
    zIndex:999,
		color: '#dddddd',
    opacity:0.3,
	},
  bottom: {
    color: theme.palette.grey[theme.palette.type === 'light' ? 200 : 700],
  },
  cprogress:{
    position: 'relative',
  },
  loading:{
    width:'80%',
    fontSize:'16px',
    
  }
}
));




function App() {
  const classes = useStyles();
  const [modalStyle] = React.useState(getModalStyle);
  const [posts, setPosts] = useState([]);
  const [open, setOpen] = React.useState(false);
  const [openSignIn, setOpenSignIn] = React.useState(false);
  const [openEdit, setOpenEdit] = React.useState(false);
  const [username, setUsername] = useState('');
  const [newusername, setNewusername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState('');
  
 


  //useEffect runs a piece of code based on a specific condition
  useEffect(()=>{
    
    db.collection('posts').orderBy('timestamp','desc').onSnapshot( snapshot => {
    
    //everytime a change happens this code will run
    //everytime a new post is added this code runs
    setPosts(snapshot.docs.map(doc => ({
        id :doc.id,
        post: doc.data()
        
    })));
    })
  },[posts]);

 useEffect(()=>{
   if(user){
      db.collection('member').where("userid", "==", user.uid).get().then((resultSnapShot) => {
        if(resultSnapShot.size === 0){                 
          console.log(JSON.stringify(user.uid)+"MEMBER DOC UPDATE")
          db.collection('member').add({
            userid: user.uid,
            username: user.displayName, 
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            lastupdated:firebase.firestore.FieldValue.serverTimestamp(),    
          }).catch((error) => alert(error.message));
          console.log("Add New Member DONE!")
        }else{
          console.log("NO Member to add!")
        }
      });
    }    
 },[user])
  

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser)=>{
        if(authUser){ 
          //user has logged in
          console.log(JSON.stringify(authUser.displayName)+"LOGGED IN");         
          setUser(authUser);
          
          if(authUser.displayName){
          //dont update username
          }else{
            return authUser.updateProfile({
              displayName: username,
              
            });
          }
          
        }else{
          //user has logged out
          setUser(null);
        }
    });

    return () =>{
      //perform cleanup actions
      unsubscribe();
    }
  }, [user, username]);


  
  const signUp = (event) => {
    event.preventDefault(); 

    db.collection('member').where("username", "==", username).get().then((resultSnapShot) => {

      // resultSnapShot is an array of docs where "username", "==", username
      if (resultSnapShot.size === 0) {
          //Proceed
          
          console.log(resultSnapShot.size+"Username Doesnt exist!!!")
                
          auth.createUserWithEmailAndPassword(email,password)
          .then((authUser)=>{
            return authUser.user.updateProfile({
              displayName: username
            })     
          } 
          ).catch((error) => alert(error.message));

          //add new member info to member doc
          //addMember();

          setOpen(false);
          
          
          
          
      } else {
          //Already registered
          console.log(resultSnapShot.size+"Username exists!!!")
          alert('User Name Is Already Taken');
      }
      
  }) 
  } 


 
  const signIn = (event) => {
    event.preventDefault(); 
    auth.signInWithEmailAndPassword(email,password)
    .catch((error) => alert(error.message));
    setOpenSignIn(false);
  }
  
  //update new username on comments
  const editNameOnComments = ()=>{
    db.collection('posts').get().then(
      (snapshot)=>{
       snapshot.forEach((doc)=>{
          console.log("Chekcing comments on post to update username!") 
          const postId = doc.id;

          //iterate through all post comments to see match
          db.collection('posts').doc(postId).collection('comments').where("userid", "==", user.uid).get().then((resultSnapShot) =>{
          console.log(resultSnapShot.size+"comments needs to be updated!") 

            if(resultSnapShot.size>0){
              
              resultSnapShot.forEach((doc)=>{
                //update new usernames on post                  
                db.collection('posts').doc(postId).collection('comments').doc(doc.id).update({
                  username: newusername
                }).catch((error) => alert(error.message));
                console.log("Username on comments update DONE! A");             
                
              });
              console.log("Username on comments update DONE! B");   refreshPage();           
            }else if(resultSnapShot.size===0){
              refreshPage();   

            }
            
            
            }).catch((error) => alert(error.message));
    
        }
        )
      }
  ).catch((error) => alert(error.message));
     
 }

  

  //change username
  const editName = (event) => {
    event.preventDefault();
    
    //check if new username is submitted properly
    if(newusername ==="" || newusername === null || newusername === user.displayName){
          alert("Please input new user name.")
    
    }else{
    //check if the new username is not in use
    db.collection('member').where("username", "==", newusername).get().then((resultSnapShot) => {

      if (resultSnapShot.size === 0) {
      //Proceed (new username is avaliable)
      console.log("New Username is avaliable!")
      // (1)CHANGE username on Post
      db.collection('posts').where("userid", "==", user.uid).get().then((resultSnapShot) => {
        
        console.log(resultSnapShot.size+"posts to update!!! Goodbye "+user.displayName);
        if(resultSnapShot.size>0){
          resultSnapShot.forEach((doc)=>{
            //update username on existing posts
            db.collection('posts').doc(doc.id).update({
              username: newusername,
            }).catch((error) => alert(error.message));                 
          })            
        }                              
        }).catch((error) => alert(error.message));
        
      // (2)CHANGE username on comments
      console.log('UPDATE Comments with User Name')
      
      editNameOnComments();


      // (3)CHANGE username on Auth user profile
      auth.currentUser.getIdToken(true)
      .then(()=>{
        return auth.currentUser.updateProfile({      
          displayName: newusername
        })      
      }
      ).catch((error) => alert(error.message)).then(

      // (4)CHANGE (update) username on existing member doc
      db.collection('member').where("userid", "==", auth.currentUser.uid).get().then((resultSnapShot) => {
          if(resultSnapShot !==0){
            resultSnapShot.forEach((doc)=>{
              
              db.collection('member').doc(doc.id).update({
                username: newusername,
                lastupdated:firebase.firestore.FieldValue.serverTimestamp(),
              }).catch((error) => alert(error.message));                 
            })  
          }
          console.log("MEMBER DOC username updated")
          
      })
      ).catch((error) => alert(error.message));
      
      //close the modal
      setOpenEdit(false);
      
      
      }else{
        //IF already in use
        console.log(resultSnapShot.size+"Username exists!!!")
        alert('The Username is taken. 이미 사용중 입니다.');
      }

    })            
  } 
}

  
  

  return (
    <div className="App">

        <Modal
          open={open}
          onClose={()=> (setOpen(false))}
        >
        <div style={modalStyle} className={classes.paper}>

          <center className="img_logo" >
            <img src="https://firebasestorage.googleapis.com/v0/b/instagram-clone-react-be867.appspot.com/o/images%2Fwws01a.png?alt=media&token=494b6457-fb03-40ea-ab0f-868d910bd61c" alt=""/>
          </center>
          <form className="app__signup">        
            <Input
              type = "text"
              placeholder="username"
              value={username}
              onChange ={(e)=>setUsername(e.target.value)}
            />
            <Input
              type = "text"
              placeholder="email"
              value={email}
              onChange ={(e)=>setEmail(e.target.value)}
            />

            <Input
              type = "text"
              placeholder="password"
              value={password}
              onChange ={(e)=>setPassword(e.target.value)}
            />
            <center>
            <Button type="submit" onClick={signUp}>Sign Up</Button>
            </center>
          </form>
        </div>
        </Modal>

      <Modal 
          open={openSignIn}
          onClose={() => (setOpenSignIn(false))}
       >
         
        <div style={modalStyle} className={classes.paper}>          
          <center className="img_logo" >
            <img src="https://firebasestorage.googleapis.com/v0/b/instagram-clone-react-be867.appspot.com/o/images%2Fwws01a.png?alt=media&token=494b6457-fb03-40ea-ab0f-868d910bd61c" alt=""/>
          </center>
          <form className="app__signup">        

            <Input
              type = "text"
              placeholder="email"
              value={email}
              onChange ={(e)=>setEmail(e.target.value)}
            />

            <Input
              type = "text"
              placeholder="password"
              value={password}
              onChange ={(e)=>setPassword(e.target.value)}
            />
            <center>
            <Button type="submit" onClick={signIn}>Log In</Button>
            </center>
          </form>
        </div>
        
      </Modal>

      <Modal
          open={openEdit}
          onClose={()=> (setOpenEdit(false))}
        >
        <div style={modalStyle} className={classes.paper}>

          <center className="img_logo" >
            <img src="https://firebasestorage.googleapis.com/v0/b/instagram-clone-react-be867.appspot.com/o/images%2Fwws01a.png?alt=media&token=494b6457-fb03-40ea-ab0f-868d910bd61c" alt=""/>
          </center>
         <center>
            { user? (
              user.photoURL? (<img className="img_profile" src={user.photoURL} alt="No Profile"/>):(<Avatar className="post__avatar"            
              alt={username}/>)          
              )
              : (<span></span>)}
            { user? 
              (<p>Current User Name: {user.displayName}</p>)
              :(<span></span>)}

              
           
         </center>


          <form className="app__signup">     
          <label></label>   
            <Input
              type = "text"
              placeholder="New User Name"
              value={newusername}
              onChange ={(e)=>setNewusername(e.target.value)}
            />
          
            <center>
            <Button className="editname__btn" type="submit" onClick={editName}>Change Name</Button>
            </center>
            </form>

            
            <form className="app__signup">  
            <center>
            {user?(<ProfileImgUpload/> ):(<span></span>)}
         </center>
          </form>
        </div>
        </Modal>
     
      <div className="app__header">
        <img className="app__headerImage" src="https://firebasestorage.googleapis.com/v0/b/instagram-clone-react-be867.appspot.com/o/images%2Fwws01a.png?alt=media&token=494b6457-fb03-40ea-ab0f-868d910bd61c" alt=""/>
      

      { user ? (
      <div className="app__loginContainer">
        <Button onClick={ (()=> setOpenEdit(true)) }>Edit</Button>
      <Button onClick={ (()=> auth.signOut()) }> LogOut</Button>
      </div>
      ) :
      ( <div className="app__loginContainer">
        <Button onClick={ (()=> setOpen(true)) }>Sign Up</Button>
        <Button onClick={ (()=> setOpenSignIn(true)) }>Log In</Button>
        </div>     
      )

      }

      </div>
      <center>
        <p className="app__posts profile__image">

          {user? (

            user.photoURL? (<img src={user.photoURL} alt="No Profile"/>):(<Avatar className="post__avatar"            
            alt={username}/>)          
          )
          : (<span></span>)
          
          
          
          }
          </p>
          <p>
          HELLO, 
          {user ? (
          <span> {user.displayName}. </span>):(<span> </span>)}
           Welcome to WHO WHAT STARE.</p>
      </center>
      <div className="app__posts cprogress">
      { !newusername ?
        (          
          posts.map(({id,post}) =>(
          <Post key={id} postId={id} user={user} username={post.username} caption={post.caption} imageUrl ={post.imageUrl} profileimageUrl={post.profileimageUrl}/>)) 
        
        ):(
          <Backdrop className={classes.backdrop} open>         
              <center>
              <p className={classes.loading} >Saving...</p>
              </center>
          </Backdrop>
        )
      }
      </div>

      { user?.displayName ?
        (<ImageUpload username ={user.displayName} userId={user.uid} profileimageUrl={user.photoURL}/> )
        : (<center><p>Sorry, you need to log in for uploads and comments.</p></center>)
      }


    </div>
  );
}

export default App;
