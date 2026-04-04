import { useState } from 'react'

export function useModalControl() {
    const [open, setOpen] = useState(false)
    const handleCloseModal = () => {
        setOpen(false)
    }
    const handleOpenModal = () => {
        setOpen(true)
    }
    return { open, handleCloseModal, handleOpenModal }
}
