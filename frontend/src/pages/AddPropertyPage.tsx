import {useState} from "react";
import {useAuthStore} from "../store/authStore";
import {createProperty} from "../services/propertyService";


export default function AddPropertyPage(){


const {user}=useAuthStore();


const [property,setProperty]=useState({

title:"",
description:"",
price:"",
city:"",
state:"",
type:"rent",
bedrooms:""

});



const handleChange=(e:any)=>{

setProperty({

...property,

[e.target.name]:e.target.value

})

}



const submit=async()=>{


const data={

...property,

sellerId:user?.userId,

verificationStatus:false,

createdAt:new Date().toISOString()

}


await createProperty(data);


alert("Property Added");


}




return(

<div className="min-h-screen bg-black text-white p-10">


<h1 className="text-5xl font-bold mb-10">

Add New Property

</h1>



<input

className="block p-4 bg-gray-900 mb-4 w-full"

name="title"

placeholder="Property Title"

onChange={handleChange}

/>



<textarea

className="block p-4 bg-gray-900 mb-4 w-full"

name="description"

placeholder="Description"

onChange={handleChange}

/>



<select

className="block p-4 bg-gray-900 mb-4"

name="type"

onChange={handleChange}

>


<option value="rent">

Rent

</option>


<option value="sale">

Sale

</option>


</select>




<input

className="block p-4 bg-gray-900 mb-4"

name="price"

placeholder="Price"

onChange={handleChange}

/>



<input

className="block p-4 bg-gray-900 mb-4"

name="city"

placeholder="City"

onChange={handleChange}

/>



<input

className="block p-4 bg-gray-900 mb-4"

name="state"

placeholder="State"

onChange={handleChange}

/>




<input

className="block p-4 bg-gray-900 mb-4"

name="bedrooms"

placeholder="Bedrooms"

onChange={handleChange}

/>



<button

onClick={submit}

className="bg-yellow-500 text-black px-8 py-4"

>

Submit Property

</button>


</div>


)

}