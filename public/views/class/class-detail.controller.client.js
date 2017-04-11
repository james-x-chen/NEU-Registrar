(function () {
    angular
        .module("NEURegistrar")
        .controller("ClassDetailController", ClassDetailController);

    function ClassDetailController($location, $window, $routeParams, ClassService, ScheduleService) {
        var vm = this;
        vm.returnToSchedule = returnToSchedule;
        vm.saveAndReturnToSchedule = saveAndReturnToSchedule;
        vm.isPeakPeriod = isPeakPeriod;
        vm.updateEndingTimes = updateEndingTimes;
        vm.updateOnChangeOfTime = updateOnChangeOfTime;
        vm.toastMessage = toastMessage;
        vm.extractTargetAttributes = extractTargetAttributes;
        vm.differentFromLastYear = differentFromLastYear;

        function init() {
            vm.loggedInUser = JSON.parse($window.sessionStorage.loggedInUser ? $window.sessionStorage.loggedInUser : null);

            if (!vm.loggedInUser) {
                $location.url("/login");
            } else {
                vm.class = findClassInSessionState($routeParams.unique_id); // find in session state for now until I figure out how to pass the specified course to this controller

                vm.allSubjectCodes = ClassService.getAllSubjectCodes();
                vm.currentTerm = ClassService.getCurrentTerm();
                vm.allInstructionalMethods = ClassService.getAllInstructionalMethods();
                vm.allMeetingDays = ClassService.getAllMeetingDays();
                vm.allCampuses = ClassService.getAllCampuses();
                vm.yesOrNo = ClassService.getYesOrNo();
                vm.allSpecialApprovals = ClassService.getAllSpecialApprovals();

                ClassService.getAllInstructors()
                    .then(
                        function (res) {
                            vm.allInstructors = res.data;
                        },
                        function (error) {
                            vm.error = error.data;
                        }
                    );

                vm.allMeetingStartTimes = ClassService.getAllTimeIntervals();
                vm.allMeetingEndTimes = ClassService.getAllTimeIntervals();

                vm.allRestrictions = ClassService.getAllRestrictions();
                vm.allBillingAttributes = ClassService.getAllBillingAttributes();

                vm.allStatuses = ClassService.getAllStatuses();
            }
        }

        function returnToSchedule() {
            $location.url("/schedule-submission");
        }

        function saveAndReturnToSchedule() {
            var invalidClassReasons = ClassService.getInvalidClassReasons(vm.class);
            if (invalidClassReasons.length) {
                vm.error = invalidClassReasons.join("\n\n");
                $window.scrollTo(0, 0);
            } else {
                vm.class.metadata = vm.class.metadata || {};
                vm.class.metadata.modified = ClassService.isClassModified(vm.class);
                vm.class.metadata.deleted = (vm.class.status === "C");

                var schedule = JSON.parse($window.sessionStorage.schedule);
                schedule[vm.class.sessionStateIndex] = vm.class;
                $window.sessionStorage.schedule = JSON.stringify(schedule);
                $location.url("/schedule-submission");
            }
        }

        function findClassInSessionState(unique_id) {
            var schedule = JSON.parse($window.sessionStorage.schedule);
            for (var x = 0; x < schedule.length; x++) {
                var current = schedule[x];
                if (current.metadata.unique_id === unique_id) {
                    current.sessionStateIndex = x;
                    return current;
                }
            }
        }

        function toastMessage(show) {
            var x = document.getElementById("toast");
            if (show) {
                x.className = "show";
                setTimeout(function () {
                    x.className = "";
                }, 6000);
            } else {
                x.className = "";
            }
        }

        function isPeakPeriod(day, time) {
            var isPeakPeriod = 0;
            var x = document.getElementById("toast");
            if (day === "M" || day === "W" || day === "R" ||
                day === "MW" || day === "MWR") {
                if ((time.slice(0, 2) == 15 && time.slice(-2) <= 25) ||
                    (time.slice(0, 2) > 9 && time.slice(0, 2) < 15) ||
                    (time.slice(0, 2) == 9 && time.slice(-2) >= 15)) {
                    isPeakPeriod = 1;
                }
            }
            if (day === "T" || day === "F" || day === "TF") {
                if ((time.slice(0, 2) == 15 && time.slice(-2) <= 25) ||
                    (time.slice(0, 2) > 9 && time.slice(0, 2) < 15) ||
                    (time.slice(0, 2) == 9 && time.slice(-2) >= 50)) {
                    isPeakPeriod = 1;
                }
            }
            if (isPeakPeriod) {
                if (x.className !== "show")
                    toastMessage(1);
            }
            return isPeakPeriod;
        }

        function updateEndingTimes() {
            var startTimeIdx = vm.allMeetingStartTimes.indexOf(vm.class.meetingStart);
            var classMinDuration = 65;
            var classMaxDuration = 210;
            vm.allMeetingEndTimes = vm.allMeetingStartTimes
                .slice(startTimeIdx + classMinDuration / 5, startTimeIdx + classMaxDuration / 5 + 1);
        }

        function updateOnChangeOfTime(isMeetingStart) {
            if (isMeetingStart)
                updateEndingTimes();
            vm.isPeakPeriod = isPeakPeriod(vm.class.meetingDays, vm.class.meetingStart) ||
                isPeakPeriod(vm.class.meetingDays, vm.class.meetingEnd);
        }

        function extractTargetAttributes(targetAttribute, sourceAttribute, allData, localData) {
            if (!allData || !localData) {
                return null;
            }

            var targetData = [];
            for (var x = 0; x < localData.length; x++) {
                var localDataSourceAttribute = localData[x];
                for (var y = 0; y < allData.length; y++) {
                    if (localDataSourceAttribute === allData[y][sourceAttribute]) {
                        targetData.push(allData[y][targetAttribute]);
                    }
                }
            }

            if (targetData.length === 0) {
                return "(none)";
            } else if (targetData.length == 1) {
                return targetData[0];
            } else {
                return targetData.join(", ");
            }
        }

        function differentFromLastYear(attributes) {
            for (var x = 0; x < attributes.length; x++) {
                var attribute = attributes[x];
                if (vm.class[attribute].constructor === Array) {
                    if (vm.class.old && !arraysEqual(vm.class[attribute], vm.class.old[attribute])) {
                        return true;
                    }
                } else {
                    if (vm.class.old && vm.class[attribute] !== vm.class.old[attribute]) {
                        return true;
                    }
                }
            }
            return false;
        }

        init();
    }
})();