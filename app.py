import math

from flask import Flask, render_template, request

app = Flask(__name__)

# Physics model: single muzzle velocity, variable elevation angle.
# Calibrated so max range (700 m) occurs at 45 degrees, per standard
# projectile motion: range = v^2 * sin(2 * theta) / g.
GRAVITY = 9.8  # m/s^2
MAX_RANGE = 700  # m
MUZZLE_VELOCITY = math.sqrt(MAX_RANGE * GRAVITY)  # m/s

# The game's X/Y grid is in units of 100 m (a raw coordinate difference of
# 6.7 corresponds to an actual 670 m distance).
COORDINATE_SCALE_M = 100  # meters per X/Y coordinate unit


def solve_for_angle(theta_rad):
    height = (MUZZLE_VELOCITY * math.sin(theta_rad)) ** 2 / (2 * GRAVITY)
    time_of_flight = (2 * MUZZLE_VELOCITY * math.sin(theta_rad)) / GRAVITY
    return {
        "elevation_deg": math.degrees(theta_rad),
        "height": height,
        "time_of_flight": time_of_flight,
    }


def parse_coord(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


@app.route("/", methods=["GET", "POST"])
def index():
    form_values = {"firer_x": "", "firer_y": "", "target_x": "", "target_y": ""}
    error = None
    result = None

    if request.method == "POST":
        form_values = {key: request.form.get(key, "") for key in form_values}

        fx = parse_coord(form_values["firer_x"])
        fy = parse_coord(form_values["firer_y"])
        tx = parse_coord(form_values["target_x"])
        ty = parse_coord(form_values["target_y"])

        if None in (fx, fy, tx, ty):
            error = "Enter numeric X/Y coordinates for both the firing position and the target."
        else:
            distance = math.hypot(tx - fx, ty - fy) * COORDINATE_SCALE_M

            if distance == 0:
                error = "Target is on top of the firing position — there is no distance to solve for."
            elif distance > MAX_RANGE:
                error = f"Target is {distance:.1f} m away, which exceeds the mortar's {MAX_RANGE} m max range."
            else:
                ratio = distance / MAX_RANGE  # sin(2 * theta)
                theta_low = math.asin(ratio) / 2
                theta_high = math.pi / 2 - theta_low

                result = {
                    "distance": distance,
                    "high": solve_for_angle(theta_high),
                    "low": solve_for_angle(theta_low),
                }

    return render_template("index.html", form_values=form_values, error=error, result=result)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
