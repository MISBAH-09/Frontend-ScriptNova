// export default function Header({page,setMobileMenu}){

// const titles={
// generate:"Generate Blog",
// manage:"My Blogs",
// editor:"Blog Editor",
// settings:"Settings"
// }

// return(

// <div className="border-b px-4 md:px-8 py-4 flex items-center gap-4 bg-white text-slate-900">

// <button
// className="md:hidden text-2xl"
// onClick={()=>setMobileMenu(true)}
// >
// ☰
// </button>

// <h1 className="text-xl md:text-3xl font-bold">
// {titles[page]}
// </h1>

// </div>

// )
// }


export default function Header({page,setMobileMenu}){

const titles={
generate:"Generate Blog",
manage:"My Blogs",
editor:"Blog Editor",
settings:"Settings"
}

return(

<div className="bg-white border-b-4 px-4 md:px-8 py-4 flex items-center gap-4 bg-pink-200 border-b-pink-500">

<button
className="md:hidden text-2xl"
onClick={()=>setMobileMenu(true)}
>
☰
</button>

<h1 className="text-xl md:text-3xl font-bold ">
{titles[page]}
</h1>

</div>

)
}