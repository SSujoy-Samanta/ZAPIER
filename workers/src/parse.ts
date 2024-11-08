export function parse(text:string,value:any,startDelimeter="{",endtDelimeter="}"){
    //you recived amount {comment.amount} from {comment.address}
    // {
    //     "comment":{
    //         "amount":"200000",
    //         "address":"shjdbsfjbdj",
    //         "email":"sujoy@gmail.com"
    
    //     }
    // }
    try{
        let startIndex=0;
        let endIndex=1;
        let finalValue="";
        while(endIndex<text.length){
            if(text[startIndex]===startDelimeter){
                let endPoint=startIndex+2;
                while(text[endPoint]!=endtDelimeter){
                    endPoint++;
                }
                let stringValue=text.slice(startIndex+1,endPoint);
                let keys=stringValue.split('.');
                let localValues={
                    ...value
                }
                for(let i=0;i<keys.length;i++){
                    if(typeof localValues ==='string'){
                        localValues=JSON.parse(localValues);
                    }
                    localValues=localValues[keys[i]];
                }
                finalValue+=localValues;
                startIndex=endPoint+1;
                endIndex=endPoint+2;

            }else{
                finalValue+=text[startIndex];
                startIndex++;
                endIndex++
            }
        }
        return finalValue;
    }catch(e){
        return "not Parsed";
    }
    
}