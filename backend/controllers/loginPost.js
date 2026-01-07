export default async function loginPost(req,res){
    try{
        console.log(req.body.data );
        const { identify, password } = req.body.data;
        console.log(identify ," : ", password);
        res.send(identify,password);
    }
    catch(err){
        console.log(err);
    }
}

