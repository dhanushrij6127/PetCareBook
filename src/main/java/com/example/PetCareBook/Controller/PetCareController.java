package com.example.PetCareBook.Controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.PetCareBook.entity.Owner;
import com.example.PetCareBook.entity.Pet;
import com.example.PetCareBook.entity.VaccineType;
import com.example.PetCareBook.entity.VaccinationRecord;
import com.example.PetCareBook.service.PetCareService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class PetCareController {

    private final PetCareService petCareService;

    public PetCareController(PetCareService petCareService) {
        this.petCareService = petCareService;
    }

    // =========================
    // OWNER APIs
    // =========================

    @PostMapping("/owners")
    public ResponseEntity<Owner> addOwner(
            @Valid @RequestBody Owner owner) {

        return new ResponseEntity<>(
                petCareService.addOwner(owner),
                HttpStatus.CREATED);
    }

    @GetMapping("/owners")
    public ResponseEntity<List<Owner>> getAllOwners() {

        return ResponseEntity.ok(
                petCareService.getAllOwners());
    }

    @GetMapping("/owners/{id}")
    public ResponseEntity<Owner> getOwnerById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                petCareService.getOwnerById(id));
    }

    @PutMapping("/owners/{id}")
    public ResponseEntity<Owner> updateOwner(
            @PathVariable Long id,
            @Valid @RequestBody Owner owner) {

        return ResponseEntity.ok(
                petCareService.updateOwner(id, owner));
    }

    @DeleteMapping("/owners/{id}")
    public ResponseEntity<String> deleteOwner(
            @PathVariable Long id) {

        petCareService.deleteOwner(id);

        return ResponseEntity.ok(
                "Owner deleted successfully");
    }

    // =========================
    // PET APIs
    // =========================

    @PostMapping("/pets")
    public ResponseEntity<Pet> addPet(
            @Valid @RequestBody Pet pet) {

        return new ResponseEntity<>(
                petCareService.addPet(pet),
                HttpStatus.CREATED);
    }

    @GetMapping("/pets")
    public ResponseEntity<List<Pet>> getAllPets() {

        return ResponseEntity.ok(
                petCareService.getAllPets());
    }

    @GetMapping("/pets/{id}")
    public ResponseEntity<Pet> getPetById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                petCareService.getPetById(id));
    }

    @PutMapping("/pets/{id}")
    public ResponseEntity<Pet> updatePet(
            @PathVariable Long id,
            @Valid @RequestBody Pet pet) {

        return ResponseEntity.ok(
                petCareService.updatePet(id, pet));
    }

    @DeleteMapping("/pets/{id}")
    public ResponseEntity<String> deletePet(
            @PathVariable Long id) {

        petCareService.deletePet(id);

        return ResponseEntity.ok(
                "Pet deleted successfully");
    }

    // =========================
    // VACCINE TYPE APIs
    // =========================

    @PostMapping("/vaccines")
    public ResponseEntity<VaccineType> addVaccineType(
            @Valid @RequestBody VaccineType vaccineType) {

        return new ResponseEntity<>(
                petCareService.addVaccineType(vaccineType),
                HttpStatus.CREATED);
    }

    @GetMapping("/vaccines")
    public ResponseEntity<List<VaccineType>> getAllVaccineTypes() {

        return ResponseEntity.ok(
                petCareService.getAllVaccineTypes());
    }

    @GetMapping("/vaccines/{id}")
    public ResponseEntity<VaccineType> getVaccineTypeById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                petCareService.getVaccineTypeById(id));
    }

    @PutMapping("/vaccines/{id}")
    public ResponseEntity<VaccineType> updateVaccineType(
            @PathVariable Long id,
            @Valid @RequestBody VaccineType vaccineType) {

        return ResponseEntity.ok(
                petCareService.updateVaccineType(id, vaccineType));
    }

    @DeleteMapping("/vaccines/{id}")
    public ResponseEntity<String> deleteVaccineType(
            @PathVariable Long id) {

        petCareService.deleteVaccineType(id);

        return ResponseEntity.ok(
                "Vaccine type deleted successfully");
    }

    // =========================
    // VACCINATION APIs
    // =========================

    @PostMapping("/vaccinations")
    public ResponseEntity<VaccinationRecord> addVaccination(
            @Valid @RequestBody VaccinationRecord record) {

        return new ResponseEntity<>(
                petCareService.addVaccination(record),
                HttpStatus.CREATED);
    }

    // Complete vaccination history of a pet

    @GetMapping("/pets/{petId}/vaccinations")
    public ResponseEntity<List<VaccinationRecord>> getVaccinationHistory(
            @PathVariable Long petId) {

        return ResponseEntity.ok(
                petCareService.getVaccinationHistory(petId));
    }

    // Pets having vaccinations due within next 7 days

    @GetMapping("/vaccinations/due-soon")
    public ResponseEntity<List<Pet>> getUpcomingVaccinations() {

        return ResponseEntity.ok(
                petCareService.getPetsWithUpcomingVaccinations());
    }
}