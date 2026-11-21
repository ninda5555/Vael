package com.example.data

import com.example.model.MonthMoonEvent
import com.example.model.MoonPhaseInfo
import com.example.model.MoonPhaseKey
import com.example.model.SignId
import com.example.model.SunCalculationResult
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter
import java.util.Locale
import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.floor
import kotlin.math.roundToInt
import kotlin.math.sin

/**
 * Deterministic astronomical engine (Jean Meeus / Astronomical Algorithms)
 * for solar ecliptic longitude, Lahiri sidereal moon approximation, and lunar phases.
 */
object AstronomyEngine {

    private const val DEG2RAD = PI / 180.0
    private val SIGN_ORDER = SignId.entries

    fun normalizeDegrees(deg: Double): Double {
        val m = deg % 360.0
        return if (m < 0.0) m + 360.0 else m
    }

    fun todayDateString(timeZone: String): String {
        val zone = safeZoneId(timeZone)
        return LocalDate.now(zone).toString()
    }

    fun safeZoneId(timeZone: String): ZoneId = try {
        ZoneId.of(timeZone)
    } catch (_: Exception) {
        ZoneId.systemDefault()
    }

    fun buildWeekDates(centerDateStr: String): List<String> {
        val center = parseDateOrToday(centerDateStr)
        val dayOfWeekSunZero = center.dayOfWeek.value % 7 // Sun=0..Sat=6
        val start = center.minusDays(dayOfWeekSunZero.toLong())
        return (0..6).map { start.plusDays(it.toLong()).toString() }
    }

    fun parseDateOrToday(dateStr: String): LocalDate = try {
        LocalDate.parse(dateStr)
    } catch (_: Exception) {
        LocalDate.now()
    }

    /** Julian Day from UTC Instant */
    fun toJulianDay(instant: Instant): Double {
        return instant.toEpochMilli() / 86_400_000.0 + 2440587.5
    }

    /** Apparent geocentric ecliptic longitude of the Sun in degrees (0..360) */
    fun sunEclipticLongitude(instant: Instant): Double {
        val jd = toJulianDay(instant)
        val t = (jd - 2451545.0) / 36525.0
        val l0 = normalizeDegrees(280.46646 + t * (36000.76983 + 0.0003032 * t))
        val m = normalizeDegrees(357.52911 + t * (35999.05029 - 0.0001537 * t))
        val mRad = m * DEG2RAD
        val c = (1.914602 - t * (0.004817 + 0.000014 * t)) * sin(mRad) +
            (0.019993 - 0.000101 * t) * sin(2.0 * mRad) +
            0.000289 * sin(3.0 * mRad)
        val trueLong = l0 + c
        val omega = (125.04 - 1934.136 * t) * DEG2RAD
        val apparent = trueLong - 0.00569 - 0.00478 * sin(omega)
        return normalizeDegrees(apparent)
    }

    /** Geocentric ecliptic longitude of the Moon in degrees (0..360) */
    fun moonEclipticLongitude(instant: Instant): Double {
        val jd = toJulianDay(instant)
        val t = (jd - 2451545.0) / 36525.0
        val lPrime = normalizeDegrees(218.3164477 + 481267.88123421 * t - 0.0015786 * t * t)
        val d = normalizeDegrees(297.8501921 + 445267.1114034 * t - 0.0018819 * t * t)
        val m = normalizeDegrees(357.5291092 + 35999.0502909 * t - 0.0001536 * t * t)
        val mPrime = normalizeDegrees(134.9633964 + 477198.8675055 * t + 0.0087414 * t * t)
        val f = normalizeDegrees(93.2720950 + 483202.0175233 * t - 0.0036539 * t * t)

        val dR = d * DEG2RAD
        val mR = m * DEG2RAD
        val mpR = mPrime * DEG2RAD
        val fR = f * DEG2RAD

        val lonCorrection =
            6.288774 * sin(mpR) +
                1.274027 * sin(2.0 * dR - mpR) +
                0.658314 * sin(2.0 * dR) +
                0.213618 * sin(2.0 * mpR) -
                0.185116 * sin(mR) -
                0.114332 * sin(2.0 * fR) +
                0.058793 * sin(2.0 * dR - 2.0 * mpR) +
                0.057066 * sin(2.0 * dR - mR - mpR) +
                0.053322 * sin(2.0 * dR + mpR) +
                0.045758 * sin(2.0 * dR - mR) -
                0.040923 * sin(mR - mpR) -
                0.034720 * sin(dR) -
                0.030383 * sin(mR + mpR)

        return normalizeDegrees(lPrime + lonCorrection)
    }

    /** Lahiri ayanamsa in degrees for sidereal Vedic Moon sign */
    fun lahiriAyanamsa(instant: Instant): Double {
        val jd = toJulianDay(instant)
        val yearsSince2000 = (jd - 2451545.0) / 365.25
        return 23.853055 + yearsSince2000 * (50.290966 / 3600.0)
    }

    fun longitudeToSign(elonDegrees: Double): Pair<SignId, Double> {
        val norm = normalizeDegrees(elonDegrees)
        val index = floor(norm / 30.0).toInt() % 12
        val degInSign = ((norm - index * 30.0) * 100.0).roundToInt() / 100.0
        return SIGN_ORDER[index] to degInSign
    }

    /** Phase angle 0=New, 90=First Quarter, 180=Full, 270=Last Quarter */
    fun moonPhaseAngle(instant: Instant): Double {
        val sunLon = sunEclipticLongitude(instant)
        val moonLon = moonEclipticLongitude(instant)
        return normalizeDegrees(moonLon - sunLon)
    }

    fun getPhaseKey(angle: Double): MoonPhaseKey {
        val norm = normalizeDegrees(angle)
        return when {
            norm < 22.5 || norm >= 337.5 -> MoonPhaseKey.NEW_MOON
            norm < 67.5 -> MoonPhaseKey.WAXING_CRESCENT
            norm < 112.5 -> MoonPhaseKey.FIRST_QUARTER
            norm < 157.5 -> MoonPhaseKey.WAXING_GIBBOUS
            norm < 202.5 -> MoonPhaseKey.FULL_MOON
            norm < 247.5 -> MoonPhaseKey.WANING_GIBBOUS
            norm < 292.5 -> MoonPhaseKey.LAST_QUARTER
            else -> MoonPhaseKey.WANING_CRESCENT
        }
    }

    /** Find next instant after [from] where moon phase angle crosses [targetAngle] (0 or 180) */
    fun searchNextPhase(targetAngle: Double, from: Instant): Instant {
        val stepMillis = 6L * 3600L * 1000L // 6 hours
        var prevT = from
        var prevDiff = signedAngleDiff(moonPhaseAngle(prevT), targetAngle)
        for (i in 1..160) { // up to 40 days
            val curT = from.plusMillis(i * stepMillis)
            val curDiff = signedAngleDiff(moonPhaseAngle(curT), targetAngle)
            if (prevDiff <= 0.0 && curDiff >= 0.0 && (curDiff - prevDiff) < 120.0) {
                // Binary refine to within 2 minutes
                var lo = prevT.toEpochMilli()
                var hi = curT.toEpochMilli()
                repeat(12) {
                    val mid = (lo + hi) / 2
                    val midDiff = signedAngleDiff(moonPhaseAngle(Instant.ofEpochMilli(mid)), targetAngle)
                    if (midDiff < 0.0) lo = mid else hi = mid
                }
                return Instant.ofEpochMilli((lo + hi) / 2)
            }
            prevT = curT
            prevDiff = curDiff
        }
        return from
    }

    private fun signedAngleDiff(angle: Double, target: Double): Double {
        var diff = normalizeDegrees(angle - target)
        if (diff > 180.0) diff -= 360.0
        return diff
    }

    fun calculateMoonPhaseForDate(localDateStr: String, timeZone: String): MoonPhaseInfo {
        val zone = safeZoneId(timeZone)
        val date = parseDateOrToday(localDateStr)
        val noonInstant = ZonedDateTime.of(date, LocalTime.NOON, zone).toInstant()
        val dayStart = date.atStartOfDay(zone).toInstant()

        val phaseAngle = moonPhaseAngle(noonInstant)
        val illumination = (((1.0 - cos(phaseAngle * DEG2RAD)) / 2.0) * 100.0).roundToInt().coerceIn(0, 100)

        val nextNew = searchNextPhase(0.0, dayStart)
        val nextFull = searchNextPhase(180.0, dayStart)

        val nextNewDate = nextNew.atZone(zone).toLocalDate()
        val nextFullDate = nextFull.atZone(zone).toLocalDate()
        val sameDay = when {
            nextNewDate == date -> "new_moon"
            nextFullDate == date -> "full_moon"
            else -> null
        }

        val fmt = DateTimeFormatter.ofPattern("MMM d, HH:mm", Locale.getDefault())
        return MoonPhaseInfo(
            date = localDateStr,
            timeZone = timeZone,
            phaseAngle = (phaseAngle * 10.0).roundToInt() / 10.0,
            illumination = illumination,
            phaseKey = getPhaseKey(phaseAngle),
            nextNewMoonLabel = nextNew.atZone(zone).format(fmt),
            nextFullMoonLabel = nextFull.atZone(zone).format(fmt),
            sameDayEvent = sameDay
        )
    }

    fun getMonthMoonEvents(year: Int, month1to12: Int, timeZone: String): List<MonthMoonEvent> {
        val zone = safeZoneId(timeZone)
        val firstOfMonth = LocalDate.of(year, month1to12, 1)
        val searchStart = firstOfMonth.minusDays(1).atStartOfDay(zone).toInstant()
        val results = mutableListOf<MonthMoonEvent>()

        var cursor = searchStart
        repeat(2) {
            val nm = searchNextPhase(0.0, cursor)
            val ld = nm.atZone(zone).toLocalDate()
            if (ld.year == year && ld.monthValue == month1to12) {
                results.add(MonthMoonEvent(ld.toString(), isFullMoon = false))
            }
            cursor = nm.plusSeconds(10 * 86_400L)
        }

        cursor = searchStart
        repeat(2) {
            val fm = searchNextPhase(180.0, cursor)
            val ld = fm.atZone(zone).toLocalDate()
            if (ld.year == year && ld.monthValue == month1to12) {
                results.add(MonthMoonEvent(ld.toString(), isFullMoon = true))
            }
            cursor = fm.plusSeconds(10 * 86_400L)
        }

        return results
    }

    fun calculateTropicalSun(
        dateStr: String,
        timeStr: String?,
        timeZone: String
    ): SunCalculationResult {
        val date = try {
            LocalDate.parse(dateStr)
        } catch (_: Exception) {
            return SunCalculationResult(note = "Enter date as YYYY-MM-DD (1900–2100).")
        }
        if (date.year !in 1900..2100) {
            return SunCalculationResult(note = "Supported years are 1900–2100.")
        }
        val zone = safeZoneId(timeZone)

        if (!timeStr.isNullOrBlank()) {
            val parsedTime = try {
                LocalTime.parse(timeStr)
            } catch (_: Exception) {
                null
            }
            if (parsedTime != null) {
                val instant = ZonedDateTime.of(LocalDateTime.of(date, parsedTime), zone).toInstant()
                val (sign, deg) = longitudeToSign(sunEclipticLongitude(instant))
                return SunCalculationResult(
                    signId = sign,
                    degreeInSign = deg,
                    precision = "exact_instant",
                    note = "Apparent geocentric ecliptic longitude at $timeStr ($timeZone)."
                )
            }
        }

        val startInstant = date.atStartOfDay(zone).toInstant()
        val endInstant = date.atTime(23, 59).atZone(zone).toInstant()
        val (startSign, startDeg) = longitudeToSign(sunEclipticLongitude(startInstant))
        val (endSign, _) = longitudeToSign(sunEclipticLongitude(endInstant))

        return if (startSign == endSign) {
            SunCalculationResult(
                signId = startSign,
                degreeInSign = startDeg,
                precision = "date_only_verified",
                note = "Sun remained in the same tropical sign all day."
            )
        } else {
            SunCalculationResult(
                candidateSigns = listOf(startSign, endSign),
                precision = "date_only_verified",
                isAmbiguous = true,
                note = "Solar ingress occurred on this date — exact birth time decides between ${startSign.name.lowercase().replaceFirstChar { it.uppercase() }} and ${endSign.name.lowercase().replaceFirstChar { it.uppercase() }}."
            )
        }
    }

    fun calculateVedicMoonSign(
        dateStr: String,
        timeStr: String?,
        timeZone: String
    ): SignId? {
        if (timeStr.isNullOrBlank()) return null
        val date = try { LocalDate.parse(dateStr) } catch (_: Exception) { return null }
        val time = try { LocalTime.parse(timeStr) } catch (_: Exception) { return null }
        val zone = safeZoneId(timeZone)
        val instant = ZonedDateTime.of(LocalDateTime.of(date, time), zone).toInstant()
        val siderealMoon = normalizeDegrees(moonEclipticLongitude(instant) - lahiriAyanamsa(instant))
        return longitudeToSign(siderealMoon).first
    }
}
