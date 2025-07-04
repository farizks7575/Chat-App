import axios from 'axios';

export const commonAPI=async(httpRequest,url,reqBody,reqHeader)=>{  ////httpreq=crud method like POST,PUT,GET etc  ,url=like our localhost 3000,reqbody=data what we adding,reqHeader=it is for upload any content etc
    const reqConfig={
        method:httpRequest,
        url,
        data:reqBody,
        headers:reqHeader?reqHeader:{"Content-Type":"application/json"}   /// if uploading content is there multipart form data if uploading content is not there use application/json9                                                                        ///  if ther is uploading content involved content type will be mulipart form data
    }
    return await axios(reqConfig).then(res=>{
        return res
    }).catch(err=>{
        return err
    })

}