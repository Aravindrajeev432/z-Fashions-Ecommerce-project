var db = require("../config/connection");
var collection = require("../config/collections");
const { ObjectId } = require("mongodb");
const { response } = require("express");
const bcrypt = require("bcrypt");
var objectId = require("mongodb").ObjectId;

module.exports = {
 addToCart: (proId,userId)=>{
        console.log('ghghh');
        console.log(proId); 
        let proObj={
            item:objectId(proId),
            quantity:1
        }
        return new Promise(async(resolve,reject)=>{
          let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
          console.log(userCart);
            if(userCart){
            let proExist=userCart.products.findIndex(product=>product.item==proId)
           
            if(proExist!=-1){
                db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId),'products.item':objectId(proId)},
                {
                    $inc:{'products.$.quantity':1}
                }
                ).then(()=>{
                    resolve()
                })
            }else{
            db.get().collection(collection.CART_COLLECTION).updateOne({user:objectId(userId)},
            {
                $push:{products:proObj}
                
            }
            ).then((response)=>{
                
                resolve()
            })
            }
            }else{
                let cartObj={
                    user:objectId(userId),
                    products:[proObj]
                    
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                    resolve()
                })
            }
        })
    },

    

    getCartProducts:(userId) => {
        return new Promise(async (resolve, reject) => {
          let cartItems = await db
            .get()
            .collection(collection.CART_COLLECTION)
            .aggregate([
              {
                $match: { user: objectId(userId) },
              },
              {
                $unwind: "$products",
              },
              {
                $project: {
                  item: "$products.item",
                  quantity: "$products.quantity",
                },
              },
              {
                $lookup: {
                  from: collection.PRODUCT_COLLECTIONS,
                  localField: "item",
                  foreignField: "_id",
                  as: "product",
                },
              },
              {
                $project: {
                  item: 1,
                  quantity: 1,
                  product: {
                    $arrayElemAt: ["$product", 0],
                  },
                },
              },
            ])
            .toArray();
           console.log(cartItems);
          resolve(cartItems);
        });

  },
    
    
    
    
    
    changeProductQuantity:(details)=>{
        details.count=parseInt(details.count)
        details.quantity=parseInt(details.quantity)


        return new Promise((resolve,reject)=>{
            if(details.count==-1 && details.quantity==1){
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:objectId(details.cart)},
            {
                $pull:{products:{item:objectId(details.product)}}
            }).then((response)=>{
                resolve({removeProduct:true})
            })

           
        }else{
           db.get().collection(collection.CART_COLLECTION)
           .updateOne({_id:objectId(details.cart),'products.item':objectId(details.product)},
           {
            $inc:{
                'products.$.quantity':details.count
            }
           }
           ).then((response)=>{
            resolve({status:true})
           })
         }
      })
  },
    
    
  getCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
        let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
        if (cart) {
          count = cart.products.length;
      }
      resolve(count)
      })
    }

    


    
};