import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 8010;

const customers =[
    {
        id:1,
        name:"Alpha One",
        type:"checking",
        balance:200000,
        existingLoan:true,
        loan:[],
    },
    {
        id:2,
        name:"Alpha Two",
        type:"saving",
        balance:600000,
        existingLoan:false,
        loan:[
            {
                sanction:false,
            }
        ]
    },
    {
        id:3,
        name:"Alpha Three",
        type:"saving",
        balance:600000,
        existingLoan:false,
        loan:[]
    }
]

app.listen(PORT,() => {
    console.log(`This application is listening to ${PORT}`);
})

app.get(`/accounts/getCheckingAccounts`,async(req,res) => {
   let result= customers.filter((cust) => cust.type === "checking");
   res.status(200).json({totalCheckingAccounts:result.length});
})

app.get(`/accounts/getSavingAccounts`,async(req,res) => {
    let result= customers.filter((cust) => cust.type === "saving");
    res.status(200).json({totalSavingAccounts:result.length});
 })

app.post(`/accounts/createAccount/checking`, async(req,res) => {
    const {name} = req.body;

    console.log(`name in index is ${name}`);

    let newAccount ={id:customers.length+1,name,type:"checking",balance:0,existingLoan:false};

    //check if customer has same existing account
    let existingCustomer = customers.find((cust) => {
        return (cust.name === name && cust.type === "checking");
    })

    if(existingCustomer){
        res.status(400).json({error:"Customer already exists"});
    }
    else{
        customers.push(newAccount); 
        res.status(201).json(newAccount);
    }
})

app.post(`/accounts/createAccount/savings`, async(req,res) => {
    const {name} = req.body;

    let newAccount ={id:customers.length+1,name,type:"savings",balance:0,existingLoan:false};

    //check if customer has same existing account
    let existingCustomer = customers.find((cust) => {
        return (cust.name === name && cust.type === "savings");
    })

    if(existingCustomer){
        res.status(400).json({error:"Customer already exists"});
    }
    else{
        customers.push(newAccount); 
        res.status(201).json(newAccount);
    }
})

app.put(`/accounts/update/deposit/:id`,async(req,res) => {
    const {id} = req.params;
    const {amount} = req.body;

    //find the account 
    let findCust = customers.find((cust) => {
        return cust.id == id
    })

    //check if customer exists
    if(!findCust){
        res.status(404).json({error: "Customer not found"});
    }
    else{
        let updateAccount = {id:id,name:findCust.name,type:findCust.type,balance:findCust.balance+amount,existingLoan:findCust.existingLoan};
        res.status(200).json(updateAccount);
    }

})

app.put(`/accounts/update/withdraw/:id`,async(req,res) => {
    const {id} = req.params;
    const {amount} = req.body;
    let updateAccount ;

    //find the account 
    let findCust = customers.find((cust) => {
        return cust.id == id
    })

    if(!findCust){
        res.status(404).json({error: "Customer not found"});
    }
    else{
        //check if balance > 0
        if(findCust.balance >= amount){
             updateAccount = {id:id,name:findCust.name,type:findCust.type,balance:findCust.balance-amount,existingLoan:findCust.existingLoan};
        }
        
        res.status(200).json(updateAccount);
    }

})

app.put(`/accounts/loan/applyLoan/:id`,async(req,res) => {
    const {id} = req.params;
    const{loanAmount,monthly_income,monthly_expense,tenure_months} = req.body;
    let sanction = false;
    const INTEREST_IN_PERCENT = 8;
    let loan;

    let ratio = monthly_expense/monthly_income;
    const EMI = (loanAmount*tenure_months*INTEREST_IN_PERCENT)/100;

    let findCust = customers.find((cust) => {
        return cust.id == id
    })

    if(ratio > 0.36){
        sanction=true;
         loan ={
            id:findCust.loan.length+1,
            loanAmount:loanAmount,
            sanction,
            emi:EMI,
            tenure_months:tenure_months
        }
    }

    if(!findCust){
        res.status(404).json({error: "Customer not found"});
    }
    else{
        if(sanction){
            let getLoanArr = findCust.loan;
            getLoanArr.push(loan);
            res.status(200).json(findCust);
        } 
        else{
            res.status(200).json("Not eligible for loan sanction");
        }
    }


})