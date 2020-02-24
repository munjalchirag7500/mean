const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sha1 = require('sha1');
 const mongoose =require('mongoose');
const fs = require('fs');
const nodemailer = require("nodemailer");

 const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://munjalchirag7500:Munjal@7575@test-svcdz.mongodb.net/test?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });


// node mailer
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '',
    pass: ''
  }
});

//way2sms
// cookie = await way2sms.login('7017991909', 'm1a2trix');


// using multer
const multer=require('multer');
const path="./attach";
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null,path)
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now()+ '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
  })

   let upload = multer({ storage: storage }).single('Image');
 



// connect mongoose to mongodb
mongoose.connect("mongodb+srv://munjalchirag7500:Munjal7575@test-svcdz.mongodb.net/test?retryWrites=true&w=majority",{
 useNewUrlParser:true
 });

//schema objects
let adminLogin =require('./database/adminlogin');
let catModel =require('./database/category');
let proModel=require('./database/product');
let feedModel=require('./database/feedback');
let userLogin=require('./database/userlogin');
let cartModel=require('./database/cart');
let profile =require('./database/profile');
let usermsg=require('./database/usermsg');
let chatactive=require('./database/chatactive');
let order=require('./database/order');


let app = express();
app.use(cors());
app.use(bodyParser.json());
// login
app.post('/api/signup',function(req,res){
  let username= req.body.name;
  let password = sha1(req.body.pass);
  let ins = new adminLogin({'username':username,'password':password})
	ins.save(function(err){
		if (err) {
      res.json({'err':1,'msg':'Not Saved'});
    }
		else
		{
			res.json({'err':0,'msg':'Data saved'});
		}
	})
})
app.post('/api/adminlogin',function(req,res) {
	// body...
	let username= req.body.name;
	let password = sha1(req.body.pass);

	// //inserting data

	adminLogin.find({'username':username,'password':password},function(err,data){
		if(err){
			res.json({'msg':'error occured'})
		}
			else if(data.length==0)
			{
				res.json({'err':1,'msg':'Email or password is incorrect'})
			}
			else {
				res.json({'err':0,'msg':'logged in successfully','username':username})
			}
	})
})


//add Category
app.post('/api/addCategory',function(req,res)
{
   upload(req,res,function(err)
   {
       if(err){}
       else
       {
           let cname=req.body.cname;
           let description=req.body.description;
           let imgname=req.file.filename;
           let ins=new catModel({'cname':cname,'description':description,'image':imgname});
           ins.save(function(err)
           {
               if(err){}
               else
               {
                   res.json({'err':0,'msg':'category Saved'});
               }
           })
       }
   })
})

//get Category

app.use('/images',express.static('attach'));

app.get('/api/getCategory',function(req,res){
	catModel.find({},function(err,data){
		if(err){
			res.json({'err':1,'msg':'Error in fetching categories ,api err'})
		}
		else{
			res.json({'err':0,'cdata':data})
		}
	})

})

// delete category

app.get('/api/delcat/:id',function(req,res){
	let catid=req.params.id;
   let img;                 // to delete all the products with category
      catModel.find({'_id':catid},function(err,data){
        if(err){}
        else{
        let ncat= data[0].cname;
        img=data[0].image;


          // deleting product images from attach folder
     proModel.find({'productCategory':ncat},function(err,data){
      if(err){console.log("err"+err);}
      else{
                for(let i=0;i<data.length;i++)
                {
        console.log("deleting product image"+data[i].image);
              fs.unlink('./attach/'+data[i].image,function(err){
                if(err){console.log("err"+err)}
                  else{console.log("deleted");}
              });

                }
      }
     })  
     //  deleting product images from attach folder END

    proModel.remove({'productCategory':ncat},function(err){
        if(err){
                console.log("err in deleting product ")
                }
        else{

          console.log(" product delete success")
            }
  })
      }
  })
                   // to delete all the products with category end           





	catModel.remove({'_id':catid},function(err){
		if(err){
			res.json({'err':1,'msg':'error in deleting category'});
		}
		else{
      console.log("deleting"+img);
      fs.unlink('./attach/'+img,function(err){
        if(err){console.log("err"); } else{ console.log("deleted image"+img);}
      });
			res.json({'err':0,'msg':'Category deleted successfully!'});
		}
	})
})

// fetch cat by Id to edit category

app.get('/api/fetchcatbyid/:id',function(req,res)
{
	let cid =req.params.id;
	catModel.find({'_id':cid},function(err,data){
		if(err){}
			else{
				res.json({'err':0,'cdata':data})
			}
	})
})

//fetch product by ID to edit product details

app.get('/api/fetchprobyid/:id',function(req,res)
{
  let pid =req.params.id;
  let catListData;
  let pdata;
  console.log(pid);
  proModel.find({'_id':pid},function(err,data){
    if(err){
      console.log("err"+err);
      res.json({'err':1,'msg':'error'})
    }
      else{
              // 
              pdata=data; 
          catModel.find({},function(err,data){
              if(err){
                console.log('Error in fetching categories names ,api err');
              }
              else{
               this.catListData=data;
               console.log(data);
               console.log("category fetched for now");

               console.log(this.catListData);
               res.json({'err':0,'pdata':pdata,'catListData':data});
              }
            })
        
      }
  })
})


// save modified category data

app.post('/api/saveeditcat',function(req,res){
	
	   upload(req,res,function(err)
   {
       if(err){}
       else
       {
         let eid = req.body.id; 
         let oldCatName;
          // FETCHING OLD CAT NAME FIRST
          catModel.find({'_id':eid},function(err,data){
            if(err){}
             else{
            oldCatName=data[0].cname;
            console.log(oldCatName);
              }
              })

          //

          let ename=req.body.cname;
          let edesc=req.body.description;
          // let eid = req.body.id; 

          catModel.update({'_id':eid},{$set:{'cname':ename,'description':edesc}},function(err){
          	if(err){
          		res.json({'err':1,'msg':'Error in updating category data'});
          	}
          		else{
                      // updating  category name in products also

            proModel.updateMany({'productCategory':oldCatName},{$set:{'productCategory':ename}},function(err){
                  if(err){
                      console.log(" ERR IN Product Category update WHEN updating CategoryNAME IN CATEGORY");
                          }
                     else{
                        console.log(" Category update WHEN updating CategoryNAME IN CATEGORY success");
                          }
                    })
                    //

          			res.json({'err':0,'msg':'Changes saved successfully!'});
          		}
          })

          
       }
   })

})


// save modified product data without image


app.post('/api/save_edit_product_no_img',function(req,res){
  
     upload(req,res,function(err)
   {
       if(err){
        console.log("+++++++++++++++++++++"+err);
       }
       else
       {
         let pid = req.body.id;
         let desc =req.body.description;
         let price=req.body.price;
         let pname=req.body.pname;
         let pcat = req.body.category;
         let brand =req.body.brand; 
         console.log("--------------------------------------");
         console.log(req.body);

          proModel.update({'_id':pid},{$set:{'pname':pname,'description':desc,'productCategory':pcat,'price':price,
            'brand':brand}},function(err){
            if(err){
              console.log(err);
              res.json({'err':1,'msg':'Error in updating product data'});
            }
              else{

                res.json({'err':0,'msg':'Changes saved successfully!'});
              }
          }) 

          
       }
   })

})





// save modified product data with image


app.post('/api/save_edit_product_with_img',function(req,res){
  
     upload(req,res,function(err)
   {
       if(err){
        console.log("+++++++img also++++++++++++++"+err);
       }
       else
       {
         let pid = req.body.id;
         let desc =req.body.description;
         let price=req.body.price;
         let pname=req.body.pname;
         let pcat = req.body.category;
         let brand =req.body.brand;
         let img= req.file.filename; 
         console.log("--------------img also------------------------");
         console.log(req.body);

          proModel.update({'_id':pid},{$set:{'pname':pname,'description':desc,'productCategory':pcat,'price':price,
            'brand':brand,'image':img}},function(err){
            if(err){
              console.log(err);
              res.json({'err':1,'msg':'Error in updating product data with img'});
            }
              else{

                res.json({'err':0,'msg':'Changes saved successfully!'});
              }
          }) 

          
       }
   })

})





// change pass


app.post('/api/changepass',function(req,res){
	
	   upload(req,res,function(err)
   {
       if(err){}
       else
       {
          let oldpass=sha1(req.body.oldpass);
          let newpass=sha1(req.body.newpass);
          let uname = req.body.uname; 
          let passdata="err";
          
          console.log(oldpass+" "+newpass+" "+ uname);


          adminLogin.find({'username':uname},function(err,data){
		if(err){}
			else{
				// console.log(data);
				 let dbpass=data[0].password;
				// console.log(data[0].password);
			if(oldpass==dbpass)
          	{
         		 adminLogin.update({'username':uname},{$set:{'password':newpass}},function(err){
          			if(err){
          				res.json({'err':1,'msg':'Error in updating password'});

          					}
          			else{
          				res.json({'err':0,'msg':'Password changed successfully!'});
          				}
          })

          }
          else
          {
          	res.json({'err':1,'msg':'Error in updating password'});

          }

			}
			})


       }
   })

})

// fetch category names

app.get('/api/fetchcatnames',function(req,res){
	catModel.find({},function(err,data){
		if(err){
			res.json({'err':1,'msg':'Error in fetching categories names ,api err'})
		}
		else{
			res.json({'err':0,'cdata':data})
		}
	})

})
// add product data

app.post('/api/addproductdata',function(req,res)
{
   upload(req,res,function(err)
   {
       if(err){
       	console.log("product data add api error"+err);
       }
       else
       {
           let pname=req.body.pname;
           let pdescription=req.body.description;
           let prices=req.body.price;
           let productCategory=req.body.proCat;
           let proimgname=req.file.filename;
           let brand=req.body.brand;
           console.log("hello");
           // console.log(pname+pdescription+proimgname+price+productCategory+brand);

           let insp=new proModel({'pname':pname,'description':pdescription,'image':proimgname,
           	'productCategory':productCategory,'price':prices,'brand':brand})
            console.log(insp);
           insp.save(function(err)
           {
               if(err){
               	res.json({'err':1,'msg':'Error in saving product data'+err});
               }
               else
               {
                   res.json({'err':0,'msg':'category Saved'});
               }
           })
       }
   })
})

// fetch product data


app.get('/api/fetchproductdata',function(req,res){
  proModel.find({},function(err,data){
    if(err){
      res.json({'err':1,'msg':'Error in fetching categories ,api err'})
    }
    else{
      res.json({'err':0,'pdata':data})
    }
  })

})

// delete product

app.get('/api/delproduct/:id',function(req,res){
  let pid=req.params.id;


           // deleting product image from attach folder
     proModel.find({'_id':pid},function(err,data){
      if(err){console.log("err"+err);}
      else{
        console.log("deleting product image"+data[0].image);
        fs.unlink('./attach/'+data[0].image,function(err){});
            
      }
     })  
     //  deleting product image from attach folder END



  proModel.remove({'_id':pid},function(err){
    if(err){
      res.json({'err':1,'msg':'error in deleting product'});
    }
    else{
      res.json({'err':0,'msg':'Product deleted successfully!'});
    }
  })
})



// get feedback data to feedback panel in dashboard

app.get('/api/get_feedback',function(req,res){
  feedModel.find({},function(err,data){
    if(err){
      res.json({'err':1,'msg':'Error in fetching feedback'})
    }
    else{
      res.json({'err':0,'fdata':data})
    }
  })

})

app.get('/api/userlog',function(req,res){
  userLogin.find({},function(err,data){
    if(err){
      res.json({'err':1,'msg':err});
    }
    else if(data.length==0){
      res.json({'err':1,'msg':'No User Found'});
    }
    else{
      res.json({'err':0,'msg':data})
    }
  })
})




// listening to 7788
app.listen(7788,function(){
	console.log("listening to port : 7788");
})



///////////////////////FRONT END API//////////////////////////////////////////
//////////////////////Front End API////////////////////////////////////////////

// fetching latest products
// app.get('/api/fetch_latest_products',function(req,res){
//   proModel.find({$query:{},$orderby:{'date_created':1}},function(err,data){
//     if(err){
//       console.log("err in fetchig latest product data");
//       res.json({'err':1,'msg':'err in fetchig latest product data'})
//     }
//     else{
//       console.log("latest product fetch successfully");
//       res.json({'err':0,'latestpro':data})
//     }
//   })

// })
app.get('/api/fetch_latest_products',function(req,res){
  let query=proModel.find().sort({'date_created':-1}).limit(10);

    query.exec(function(err,data){
    if(err){
      console.log("err in fetchig latest product data");
      res.json({'err':1,'msg':'err in fetchig latest product data'})
    }
    else{
      console.log("latest 10 product fetch successfully");
      res.json({'err':0,'latestpro':data})
    }
  });

});

// fetch producs with cname  to show  products in that category

app.get('/api/fetch_pro_with_cname/:cname',function(req,res)
{
  let cname =req.params.cname;
  console.log("requesting for products having category "+cname);
  proModel.find({'productCategory':cname},function(err,data){
    if(err){}
      else{
        res.json({'err':0,'cdata':data})
      }
  })
})

//fetch data of single products using id 

app.get('/api/fetch_pro_with_id/:id',function(req,res)
{
  let cid =req.params.id;
  proModel.find({'_id':cid},function(err,data){
    if(err){}
      else{
        res.json({'err':0,'cdata':data})
      }
  })
})


//save feedback from users
app.post('/api/savefeedback',function(req,res)
{
   upload(req,res,function(err)
   {
       if(err){}
       else
       {
           let name=req.body.name;
           let email=req.body.email;
           let subject=req.body.subject;
           let feed=req.body.feedback;
           console.log(feed);
           let ins=new feedModel({'name':name,'email':email,'subject':subject,'feed':feed});
           let mailOptions = {             // mail options created
                              from: 'manishchahar148@gmail.com',
                              to: email,
                              subject: "regarding your "+subject+" feedback" ,
                              text: feed
                            };
           ins.save(function(err)
           {
               if(err){
                res.json({'err':1,'msg':'err in saving feedback'})
               }
               else
               {   

                transporter.sendMail(mailOptions, function(error, info){    //mail sent
                  if (error) {
                    console.log(error);
                  } else {
                    console.log('Email sent: ' + info.response);
                  }
                });


                   res.json({'err':0,'msg':'feedback sent successfully'});
               }
           })
       }
   })
})


//add user to database or user signup
app.post('/api/sign_up',function(req,res)
{
   upload(req,res,function(err)
   {
       if(err){
        console.log(err);
       }
       else
       {
           let upname=req.body.upname;
           let upemail=req.body.upemail;
           let uppassword=sha1(req.body.uppassword);
           let ins=new userLogin({'upname':upname,'upemail':upemail,'uppassword':uppassword});
           console.log(ins);
           ins.save(function(err)
           {
               if(err){
                console.log("err in  user signup");
               }
               else
               {
                   res.json({'err':0,'msg':'signed up successfull'});
               }
           })
       }
   })
})


//user login 

app.post('/api/user_login',function(req,res) {
  let email= req.body.inemail;
  let password = sha1(req.body.inpassword);
  console.log("inemail"+email+"inpassword"+password)
  userLogin.find({'upemail':email,'uppassword':password},function(err,data){
    if(err){
      res.json({'msg':'error occured'})
    }
      else if(data.length==0)
      {
        console.log(data+"err in user login")
        res.json({'err':1,'msg':'Email or password is incorrect'})
      }
      else {
        res.json({'err':0,'msg':'logged in successfully','username':data[0].upname,'email':data[0].upemail})
      }
  })
})


// add product  to cart

app.post('/api/add_to_cart',function(req,res)
{
   upload(req,res,function(err)
   {
       if(err){
        console.log("adding to cart  error"+err);
       }
       else
       {    let email=req.body.buyer;
           let pname=req.body.pname;
           let pdescription=req.body.description;
           let prices=req.body.price;
           let productCategory=req.body.productCategory;
           let proimgname=req.body.image;
           let brand=req.body.brand;
           console.log("hello adding product to cart");
           // console.log(pname+pdescription+proimgname+price+productCategory+brand);

           let insp=new cartModel({'email':email,'pname':pname,'description':pdescription,'image':proimgname,
            'productCategory':productCategory,'price':prices,'brand':brand})
            console.log(insp);
           insp.save(function(err)
           {
               if(err){
                res.json({'err':1,'msg':'Error in adding product to cart'+err});
               }
               else
               {
                   res.json({'err':0,'msg':'product added  to cart'});
               }
           })
       }
   })
})


// fetch product data to cart

app.get('/api/fetch_cart_items/:email',function(req,res){
  let mymail=req.params.email;
  console.log(mymail);
  cartModel.find({"email":mymail},function(err,data){
    if(err){
      res.json({'err':1,'msg':'Error in fetching cart data,api err'})
    }
    else{
            let cost=0;
        for(let i=0;i<data.length;i++)
        {
          cost=cost+data[i].price;
         }
      res.json({'err':0,'cdata':data,'total':cost})
    }
  })

})

// delete product form cart

app.post('/api/del_from_cart',function(req,res){
  let pid=req.body.id;
  console.log("pid"+pid);
  cartModel.remove({'_id':pid},function(err){
    if(err){
      res.json({'err':1,'msg':'error in deleting cart product'});
    }
    else{
      res.json({'err':0,'msg':' cart Product deleted successfully!'});
    }
  })
})


// checking user profile details

app.post('/api/check_profile',function(req,res) {
  
  let email= req.body.email;

  profile.find({'email':email},function(err,data){
    if(err){
      res.json({'msg':'error occured'})
    }
      else if(data.length==0)
      {
        res.json({'err':1,'msg':'Profile data not updated'})
      }
      else {
        res.json({'err':0,'msg':'updated profile exist','data':data})
      }
  })
})


// updating profile
app.post('/api/update_profile',function(req,res)
{
   upload(req,res,function(err)
   {
       if(err){
        console.log("profile update  error"+err);
       }
       else
       {    let email=req.body.email;
           let mobile=req.body.phone;
           let address=req.body.address;
           let dob=req.body.dob;
           let imgname=req.file.filename;
           let name=req.body.name;
           console.log("updating profile in to db");
           // console.log(pname+pdescription+proimgname+price+productCategory+brand);

           let insp=new profile({'email':email,'mobile':mobile,'dob':dob,'image':imgname,
            'address':address,'name':name})
            console.log(insp);
           insp.save(function(err)
           {
               if(err){
                res.json({'err':1,'msg':'Error in updating profile'+err});
               }
               else
               {
                   res.json({'err':0,'msg':'profile updated'});
               }
           })
       }
   })
})


// fetch searched data

app.get('/api/get_search_data/:keyword',function(req,res)
{
  let keyword =req.params.keyword;
  let list = keyword.split(" ");
  let frst=list[0];
  // console.log(list[0]);
  // console.log(list.length)

  // let exp="/"+keyword+"/"+"i"
  console.log(keyword);
  let query =proModel.find({ $or :[{'pname': { $regex: new RegExp(frst, 'i') } }, {'brand': { $regex: new RegExp(frst, 'i') } } , {'productCategory': { $regex: new RegExp(frst, 'i') } }]})
  query.exec(function(err,data){
    if(err){
      console.log("search errr"+err)
    }
      else{
        res.json({'err':0,'sdata':data})
      }
  })
})


//save User Chat

app.post('/api/save_user_chat',function(req,res)
{
   upload(req,res,function(err)
   {
       if(err){
        console.log(" user chat save error"+err);
       }
       else
       {    let email=req.body.email;
            let name=req.body.name;
            let msg=req.body.msg;
           
         // making user chat active
           let insChatActive=new chatactive({'email':email,'name':name,'active':msg})

          insChatActive.save(function(err)
              {
               if(err){
                // res.json({'err':1,'msg':'Error in saving user message'+err});
               }
               else
               {
                   // res.json({'err':0,'msg':'message sent successfully'});
               }
           })

          // makinguser chat active end



           let insp=new usermsg({'email':email,'name':name,'msg':msg})
            
           insp.save(function(err)
           {
               if(err){
                res.json({'err':1,'msg':'Error in saving user message'+err});
               }
               else
               {
                   res.json({'err':0,'msg':'message sent successfully'});
               }
           })
       }
   })
})


// fetching user messages for displaying 

app.get('/api/fetch_user_msg/:email',function(req,res) {
  
  let email= req.params.email;
  console.log("email : "+email);

  usermsg.find({'email':email},function(err,data){
    if(err){
      res.json({'msg':'error occured in fetching user msg'})
    }
      else if(data.length==0)
      {
        res.json({'err':1,'msg':'msg not found err'})
      }
      else {
        res.json({'err':0,'msg':'Msg found ','data':data})
      }
  })
})

//fetching chat requesting users in adminpanel

app.get('/api/fetch_chat_Req',function(req,res) {
  

  chatactive.find({},function(err,data){
    if(err){
      res.json({'msg':'error occured in fetching user req to chat'})
    }
      else if(data.length==0)
      {
        res.json({'err':1,'msg':'chat req user err'})
      }
      else {
        res.json({'err':0,'msg':'User found success ','data':data})
      }
  })
})


//save Admin Chat

app.post('/api/save_admin_chat',function(req,res)
{
   upload(req,res,function(err)
   {
       if(err){
        console.log(" user chat save error"+err);
       }
       else
       {    let email=req.body.email;
            let name=req.body.name;
            let msg=req.body.msg;
           
         
      // usermsg hold chat for both admin and user     

           let insp=new usermsg({'email':email,'name':name,'msg':msg})
            
           insp.save(function(err)
           {
               if(err){
                res.json({'err':1,'msg':'Error in saving admin message'+err});
               }
               else
               {
                   res.json({'err':0,'msg':'message sent successfully'});
               }
           })
       }
   })
})

//place orders
app.post('/api/save_order',function(req,res)
{
   upload(req,res,function(err)
   {
       if(err){}
       else
       {
           let buyer=req.body.buyer;
           let odata=req.body.odata;
           let orderid=req.body.orderid;
           let email=req.body.email;

           console.log(orderid);

           let emailText="";
           for(let i=0;i<odata.length;i++)
           { 
            let c=i+1;
            emailText=emailText+c+". "+"Product Name : "+odata[i].pname+"\n "+"Brand : "+odata[i].brand+"\n "+"Price : Rs"+odata[i].price+"\n"+"\n";
           }


           let mailOptions = {             // mail options created
                  from: 'manishchahar148@gmail.com',
                  to: 'manishchahar149@gmail.com', // can be replaced by email
                  subject: "Hello, "+buyer+" Order Placed Successfully"+", Order ID : "+orderid ,
                  text: emailText+"\n"+"\n"+"For Any further query you can navigate to Contact Page"+"\n"+"\n"+"Thank You \n"+"Team E-Shop"
                };
           
      
           let ins=new order({'buyer':buyer,'oData':odata,'orderId':orderid,'email':email});
           ins.save(function(err,data)
           {
               if(err){ console.log("err in saving order"+err)}
               else
               {

                // sending mail to buyer 

                transporter.sendMail(mailOptions, function(error, info){    //mail sent
                  if (error) {
                    console.log(error);
                  } else {
                    console.log('Email sent: ' + info.response);
                  }
                });

                //


                   res.json({'err':0,'msg':'order placed','track_order':data});
               }
           })
       }
   })
})


// fetching order in track order component 

app.get('/api/get_order_data/:email',function(req,res) {
  
  let email= req.params.email;
  // console.log("=============")
  // console.log("ID : "+orderId);


  order.find({'email':email},function(err,data){
    if(err){
      res.json({'msg':'error occured in fetching orders data'})
    }
      else if(data.length==0)
      {
        res.json({'err':1,'msg':'order data not found'})
      }
      else {
        res.json({'err':0,'msg':'order data received success','data':data})
      }
  })
})

// fetching address

app.get('/api/get_add/:email',function(req,res) {
  
  let email= req.params.email;



  profile.find({'email':email},function(err,data){
    if(err){
      res.json({'msg':'error occured in fetching address'})
    }
      else if(data.length==0)
      {
        res.json({'err':1,'msg':'add  not found'})
      }
      else {
        res.json({'err':0,'msg':'address fetch success','data':data})
      }
  })
})

// deleting cart data after ordering items

app.get('/api/empty_cart/:email',function(req,res){
  let email= req.params.email;

  cartModel.remove({'email':email},function(err){
    if(err){
      res.json({'err':1,'msg':'error in deleting cart product after placing order'});
    }
    else{
      res.json({'err':0,'msg':' cart Product deleted successfully after placing order!'});
    }
  })
})



