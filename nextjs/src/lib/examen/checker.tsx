"use server"

function removeEmptyEntries() {

}

export async function checkExam(formData: FormData) {
    const x = formData.entries().filter((x) => x[1].toString() !== "").toArray()

    console.log(x)
}