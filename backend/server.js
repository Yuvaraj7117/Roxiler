// const express=require('express');
// const mongoose=require('mongoose');
// const cors = require('cors');
// const Transaction=require('./Models/Transaction');

// const app=express();
// app.use(cors());
// app.use(express.json());

// mongoose.connect("mongodb+srv://admin:admin123@cluster0.7a7hrdg.mongodb.net/Roxiler?retryWrites=true&w=majority&appName=Cluster0")
// .then(()=>console.log("DB connected")) 
// .catch((e)=>{
//     console.log("DB-is-not-connected");
// })



// app.get('/initialize', async (req, res) => {
//     try {
//       const response = await fetch('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
//       const transactions = await response.json();
  
//       // Ensure unique data insertion by using upsert
//       const bulkOps = transactions.map(transaction => ({
//         updateOne: {
//           filter: { id: transaction.id },
//           update: transaction,
//           upsert: true
//         }
//       }));
  
//       try {
//         await Transaction.bulkWrite(bulkOps);
//         res.send('Database initialized with seed data');
//       } catch (error) {
//         console.error('Error initializing database:', error);
//         res.status(500).send('Error initializing database');
//       }
//     } catch (error) {
//       console.error('Error fetching data:', error);
//       res.status(500).send('Error fetching data');
//     }

//   });

//   app.get('/transactions', async (req, res) => {
//     try {
//       const transactions = await Transaction.find().exec();
//       res.json(transactions);
//     } catch (error) {
//       console.error('Error fetching transactions:', error);
//       res.status(500).send('Error fetching transactions');
//     }
//   });

  





// const PORT = 2000;
// app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));



const express=require('express');
const mongoose=require('mongoose');
const cors = require('cors');

const app=express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://admin:admin123@cluster0.7a7hrdg.mongodb.net/Roxiler?retryWrites=true&w=majority&appName=Cluster0")
.then(()=>console.log("DB connected")) 
.catch((e)=>{
    console.log("DB-is-not-connected");
})


const Transaction=require('./Models/Transaction');

app.get('/initialize', async (req, res) => {
    try {
      const response = await fetch('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
      const transactions = await response.json();
  
      // Ensure unique data insertion by using upsert
      const bulkOps = transactions.map(transaction => ({
        updateOne: {
          filter: { id: transaction.id },
          update: transaction,
          upsert: true
        }
      }));
  
      try {
        await Transaction.bulkWrite(bulkOps);
        res.send('Database initialized with seed data');
      } catch (error) {
        console.error('Error initializing database:', error);
        res.status(500).send('Error initializing database');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).send('Error fetching data');
    }

  });

  app.get('/transactions', async (req, res) => {
    const { search, page, limit } = req.query;
    const pagination = { page: parseInt(page) || 1, limit: parseInt(limit) || 10 };
  
    let query = {};
    if (search) {
      query = {
        $or: [
          { 'product.title': { $regex: search, $options: 'i' } },
          { 'product.description': { $regex: search, $options: 'i' } },
          { 'product.price': { $regex: search, $options: 'i' } },
        ],
      };
    }
  
    try {
      const transactions = await Transaction.find(query)
       .skip((pagination.page - 1) * pagination.limit)
       .limit(pagination.limit)
       .exec();
  
      const count = await Transaction.countDocuments(query).exec();
      const totalPages = Math.ceil(count / pagination.limit);
  
      res.json({
        transactions,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          totalPages,
          count,
          next: pagination.page < totalPages? `/transactions?page=${pagination.page + 1}&limit=${pagination.limit}` : null,
        },
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).send('Error fetching transactions');
    }
  });

const PORT = 2000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

