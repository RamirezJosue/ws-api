// const middlewareClient = (client = null) => async (req, res, next) => {
//     try {

//         if(!client){
//             res.status(409)
//             console.log('clineteee',client)
//             res.send({ error: 'Error de client.' }) 
//         }else{
//             req.clientWs = client;
//             next();
//         }
       

//     } catch (e) {
//         console.log(e)
//         res.status(409)
//         res.send({ error: 'Error de client' })
//     }

// }
// module.exports = { middlewareClient }


// const middlewareClient = (req, res, next) => {
//     // do some logic with req, res
//     // ...
//     // advance to the next processing step
//     // req.clientWs = 'cliente cliente';
//     next();
// }

const middlewareClient = (myParam = null) => {
    return (req, res, next) => {
        req.clientWs = myParam;
      // implement your business logic using 'myParam'
      // ...
      next();
    }
  }

module.exports = { middlewareClient }