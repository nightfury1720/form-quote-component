import * as React from "react"

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours} hours ${minutes} minutes`;
}

const AutoComplete = ({ handleAddress }) => {
    const autoCompleteRef = React.useRef()
    const inputRef = React.useRef()

    const options = {
        componentRestrictions: { country: "in" }, // "in" is the country code for India
        fields: ["address_components", "geometry", "icon", "name"],
        types: ["establishment"],
    }
    React.useEffect(() => {
        autoCompleteRef.current = new window.google.maps.places.Autocomplete(
            inputRef.current,
            options
        )
        autoCompleteRef.current.addListener("place_changed", async function () {
            const place = await autoCompleteRef.current.getPlace()
            let latitude
            let longitude
            if (place && place.geometry && place.geometry.location) {
                latitude = place.geometry.location.lat()
                longitude = place.geometry.location.lng()
            }
            handleAddress({ place, latitude, longitude })
        })
    }, [])

    return <input ref={inputRef} />
}

export default function Form() {
    const [pickupAddress, setPickupAddress] = React.useState({})
    const [dropAddress, setDropAddress] = React.useState("")
    const [date, setDate] = React.useState("")
    const [time, setTime] = React.useState("")

    // Function to handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault()
        // Handle form submission logic here
        console.log(pickupAddress, dropAddress, date, time)
        const data = {
            originLat: pickupAddress.latitude,
            originLng: pickupAddress.longitude,
            destinationLat: dropAddress.latitude,
            destinationLng: dropAddress.longitude,
        }

        try {
            const response = await fetch(
                "https://car-quote-service.vercel.app/calculate-distance",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                }
            )

            if (response.ok) {
                const result = await response.json()
                console.log("Distance:", result.distance)
                console.log("Duration:", formatDuration(result.time))
            } else {
                console.error("Error:", response.statusText)
            }
        } catch (error) {
            console.error("Error:", error.message)
        }
    }
    const formStyle = {
        height: "100%",
        backgroundColor: "green",
        padding: "20px",
        borderRadius: "10px",
    }
    React.useEffect(() => {
        console.log(pickupAddress)
    }, [pickupAddress])
    return (
        <form onSubmit={handleSubmit} style={formStyle}>
            <div>
                <label htmlFor="pickUp">Pick Up:</label>
                <AutoComplete handleAddress={setPickupAddress} />
            </div>
            <div>
                <label htmlFor="dropOff">Drop Off:</label>
                <AutoComplete handleAddress={setDropAddress} />
            </div>
            <div>
                <label htmlFor="date">Date:</label>
                <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
            </div>
            <div>
                <label htmlFor="time">Time:</label>
                <input
                    type="time"
                    id="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                />
            </div>
            <button type="submit">Submit</button>
        </form>
    )
}