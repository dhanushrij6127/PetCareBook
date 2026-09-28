package com.example.PetCareBook.exception;

public class InvalidVaccinationException extends RuntimeException {

    public InvalidVaccinationException(String message) {
        super(message);
    }
}